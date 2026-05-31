import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { runRecommendationEngine } from "./lib/recommendation/recommendationEngine.js";
import {
  buildUserEmbeddingText,
} from "./lib/embeddings/generateUserEmbedding.js";
import { buildEventEmbeddingText } from "./lib/embeddings/generateEventEmbedding.js";

// ─── Get Recommendations ──────────────────────────────────────────────────────
export const getRecommendations = action({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    const genAIKey = process.env.GEMINI_API_KEY;

    // ── 1. Fetch user & dynamically generate embedding if missing ──────────────────
    let user = await ctx.runQuery(api.users.getUserById, { userId });
    if (!user) throw new Error("User not found");

    if (genAIKey && (!user.embedding || user.embedding.length === 0)) {
      try {
        console.log(`[AI recommendations] Dynamically generating vector embedding for user: ${user.name}`);
        await ctx.runAction(api.recommendations.generateAndStoreUserEmbedding, { userId });
        // Fetch fresh user profile with populated embedding
        user = await ctx.runQuery(api.users.getUserById, { userId });
      } catch (err) {
        console.error("Failed to generate user embedding dynamically:", err);
      }
    }

    // ── 2. Fetch active events & user registrations to exclude already registered events ──
    const [events, userRegs] = await Promise.all([
      ctx.runQuery(api.events.listActiveEvents, {}),
      ctx.runQuery(api.registrations.getUserRegistrations, { userId }),
    ]);

    const registeredEventIds = new Set(userRegs.map((r) => r.eventId));

    let activeEvents = events.filter(
      (e) =>
        !e.isArchived && e.registrationDeadline > Date.now() && !registeredEventIds.has(e._id)
    );

    if (activeEvents.length === 0) return [];

    if (genAIKey) {
      let generatedAny = false;
      for (const event of activeEvents) {
        if (!event.embedding || event.embedding.length === 0) {
          try {
            console.log(`[AI recommendations] Dynamically generating vector embedding for event: ${event.title}`);
            await ctx.runAction(api.recommendations.generateAndStoreEventEmbedding, { eventId: event._id });
            generatedAny = true;
          } catch (err) {
            console.error(`Failed to generate event embedding dynamically for "${event.title}":`, err);
          }
        }
      }
      if (generatedAny) {
        // Re-fetch active events to ensure all generated embeddings are in local memory
        const freshEvents = await ctx.runQuery(api.events.listActiveEvents, {});
        activeEvents = freshEvents.filter(
          (e) =>
            !e.isArchived && e.registrationDeadline > Date.now()
        );
      }
    }

    // ── 3. Get friend IDs ──────────────────────────────────────────────────────
    const friendIds = await ctx.runQuery(api.friendships.getFriendIds, { userId });

    // ── 4. Build friend activity map ───────────────────────────────────────────
    const eventFriendActivityMap = {};
    const registeredFriendsMap = {};
    for (const event of activeEvents) {
      const [regs, likes, attendance] = await Promise.all([
        ctx.runQuery(api.registrations.getEventRegistrations, { eventId: event._id }),
        ctx.runQuery(api.events.isLiked, { eventId: event._id, userId }),
        ctx.runQuery(api.attendance.getEventAttendance, { eventId: event._id }),
      ]);

      eventFriendActivityMap[event._id] = {
        registered: regs.map((r) => r.userId),
        liked: [], // stored per-user; social inference from friends
        attended: attendance.map((a) => a.userId),
      };

      registeredFriendsMap[event._id] = regs
        .filter((r) => r.user && friendIds.includes(r.userId))
        .map((r) => ({
          _id: r.user._id,
          name: r.user.name,
          email: r.user.email,
          image: r.user.image,
        }));
    }

    // ── 5. Compute recommendations ─────────────────────────────────────────────
    const rawRecommendations = runRecommendationEngine(
      user,
      activeEvents,
      friendIds,
      eventFriendActivityMap,
      limit
    );

    const recommendations = rawRecommendations.map((rec) => ({
      ...rec,
      registeredFriends: registeredFriendsMap[rec.event._id] || [],
    }));

    // ── 6. Generate and enrich with Gemini AI recommendation messages ─────────
    if (genAIKey && recommendations.length > 0) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(genAIKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Generate messages for the top 3 recommended events in parallel
        await Promise.all(
          recommendations.slice(0, 3).map(async (rec) => {
            const semanticPercent = Math.round(rec.scores.semantic * 100);
            
            const prompt = `
You are CampusPulseAI's intelligent event advisor. Write a personalized, highly engaging, one-sentence recommendation message explaining why this campus event is a great fit for the student.

Student Profile:
- Name: ${user.name}
- Department: ${user.department || "General"}
- Year: ${user.year || "Unknown"}
- Interests: ${user.interests?.join(", ") || "None specified"}
- Skills: ${user.skills?.join(", ") || "None specified"}

Event Details:
- Title: ${rec.event.title}
- Description: ${rec.event.description}
- Category: ${rec.event.category}
- Tags: ${rec.event.tags?.join(", ") || "None"}

AI Scoring Analysis:
- Semantic Alignment Match: ${semanticPercent}%

Requirements:
- Keep the response to exactly one sentence.
- Sound encouraging, smart, and peer-like.
- Explicitly reference their specific interests/skills or department AND the semantic match percentage (e.g. "${semanticPercent}% semantic match") in a natural way.
- Do not mention technical prompt details. Keep it conversational.
`;

            try {
              const response = await model.generateContent(prompt);
              const text = response.response.text().trim().replace(/^"|"$/g, '');
              rec.aiMessage = text;
            } catch (err) {
              console.error("Gemini recommendation message generation failed for event:", rec.event.title, err);
            }
          })
        );
      } catch (err) {
        console.error("Failed to initialize Gemini for recommendation messages:", err);
      }
    }

    return recommendations;
  },
});

// ─── Generate and store event embedding ──────────────────────────────────────
export const generateAndStoreEventEmbedding = action({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.runQuery(api.events.getEventById, { eventId });
    if (!event) return;

    const text = buildEventEmbeddingText(event);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      await ctx.runMutation(api.events.updateEvent, {
        eventId,
        embedding,
      });

      return { success: true, dimensions: embedding.length };
    } catch (err) {
      console.error("Failed to generate event embedding:", err);
      return { success: false, error: err.message };
    }
  },
});

// ─── Generate and store user embedding ───────────────────────────────────────
export const generateAndStoreUserEmbedding = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(api.users.getUserById, { userId });
    if (!user) return;

    const [regs, attendance] = await Promise.all([
      ctx.runQuery(api.registrations.getUserRegistrations, { userId }),
      ctx.runQuery(api.attendance.getUserAttendance, { userId }),
    ]);

    const registeredEvents = regs.map((r) => r.event).filter(Boolean);
    const attendedEvents = attendance.map((a) => a.event).filter(Boolean);

    const text = buildUserEmbeddingText(user, [], registeredEvents, attendedEvents);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      await ctx.runMutation(api.users.updateUserEmbedding, {
        userId,
        embedding,
      });

      return { success: true };
    } catch (err) {
      console.error("Failed to generate user embedding:", err);
      return { success: false, error: err.message };
    }
  },
});
