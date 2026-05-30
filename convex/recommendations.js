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
    // ── 1. Fetch user ──────────────────────────────────────────────────────────
    const user = await ctx.runQuery(api.users.getUserById, { userId });
    if (!user) throw new Error("User not found");

    // ── 2. Fetch active events ─────────────────────────────────────────────────
    const events = await ctx.runQuery(api.events.listActiveEvents, {});
    const activeEvents = events.filter(
      (e) =>
        !e.isArchived && e.registrationDeadline > Date.now()
    );

    if (activeEvents.length === 0) return [];

    // ── 3. Get friend IDs ──────────────────────────────────────────────────────
    const friendIds = await ctx.runQuery(api.friendships.getFriendIds, { userId });

    // ── 4. Build friend activity map ───────────────────────────────────────────
    const eventFriendActivityMap = {};
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
    }

    // ── 5. Compute recommendations ─────────────────────────────────────────────
    const recommendations = runRecommendationEngine(
      user,
      activeEvents,
      friendIds,
      eventFriendActivityMap,
      limit
    );

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
