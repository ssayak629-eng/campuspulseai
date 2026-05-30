import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── List Active Events ──────────────────────────────────────────────────────
export const listActiveEvents = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit }) => {
    let q = ctx.db
      .query("events")
      .withIndex("by_archived", (q) => q.eq("isArchived", false));

    const events = await q.order("desc").collect();

    let filtered = events.filter((e) => !e.isArchived);
    if (category) filtered = filtered.filter((e) => e.category === category);

    const result = filtered.slice(0, limit ?? 50);

    // Enrich with creator info
    return await Promise.all(
      result.map(async (event) => {
        const creator = await ctx.db.get(event.createdBy);
        return { ...event, creator };
      })
    );
  },
});

// ─── Get Event by ID ─────────────────────────────────────────────────────────
export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return null;
    const creator = await ctx.db.get(event.createdBy);
    return { ...event, creator };
  },
});

// ─── Search Events ───────────────────────────────────────────────────────────
export const searchEvents = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchQuery }) => {
    const all = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
    const q = searchQuery.toLowerCase();
    return all.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  },
});

// ─── Create Event ────────────────────────────────────────────────────────────
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    venue: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    registrationDeadline: v.number(),
    maxParticipants: v.optional(v.number()),
    minMembers: v.optional(v.number()),
    posterUrl: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      ...args,
      minMembers: args.minMembers ?? 1,
      viewCount: 0,
      likeCount: 0,
      registrationCount: 0,
      isArchived: false,
      createdAt: Date.now(),
    });

    // Auto-add creator as owner organizer
    await ctx.db.insert("eventOrganizers", {
      eventId,
      userId: args.createdBy,
      role: "owner",
      addedAt: Date.now(),
    });

    return eventId;
  },
});

// ─── Update Event ────────────────────────────────────────────────────────────
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    venue: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    registrationDeadline: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
    minMembers: v.optional(v.number()),
    posterUrl: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, { eventId, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(eventId, filtered);
  },
});

// ─── Delete Event ────────────────────────────────────────────────────────────
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    // Cascade delete related data
    const relatedTables = [
      "eventOrganizers",
      "registrations",
      "eventLikes",
      "eventInteractions",
      "attendance",
    ];

    for (const table of relatedTables) {
      const records = await ctx.db
        .query(table)
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      await Promise.all(records.map((r) => ctx.db.delete(r._id)));
    }

    await ctx.db.delete(eventId);
  },
});

// ─── Archive Event ───────────────────────────────────────────────────────────
export const archiveEvent = mutation({
  args: {
    eventId: v.id("events"),
    photos: v.optional(v.array(v.string())),
    recordings: v.optional(v.array(v.string())),
    feedbackScore: v.optional(v.float64()),
  },
  handler: async (ctx, { eventId, photos, recordings, feedbackScore }) => {
    await ctx.db.patch(eventId, { isArchived: true });

    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    await ctx.db.insert("eventArchives", {
      eventId,
      attendanceCount: attendanceRecords.length,
      photos: photos ?? [],
      recordings: recordings ?? [],
      feedbackScore,
      archivedAt: Date.now(),
    });

    // Auto-create friendships between team members
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    for (const team of teams) {
      const members = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();

      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const u1 = members[i].userId;
          const u2 = members[j].userId;

          // Check if friendship already exists
          const existing = await ctx.db
            .query("friendships")
            .withIndex("by_user1", (q) => q.eq("user1", u1))
            .filter((q) => q.eq(q.field("user2"), u2))
            .unique();

          if (!existing) {
            await ctx.db.insert("friendships", {
              user1: u1,
              user2: u2,
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    return eventId;
  },
});

// ─── Increment View Count ────────────────────────────────────────────────────
export const incrementEventView = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return;
    await ctx.db.patch(eventId, { viewCount: (event.viewCount ?? 0) + 1 });
  },
});

// ─── Toggle Like ─────────────────────────────────────────────────────────────
export const toggleLike = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const existing = await ctx.db
      .query("eventLikes")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();

    const event = await ctx.db.get(eventId);

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(eventId, {
        likeCount: Math.max((event?.likeCount ?? 1) - 1, 0),
      });
      return { liked: false };
    } else {
      await ctx.db.insert("eventLikes", { eventId, userId, likedAt: Date.now() });
      await ctx.db.patch(eventId, { likeCount: (event?.likeCount ?? 0) + 1 });
      return { liked: true };
    }
  },
});

// ─── Check if user liked event ───────────────────────────────────────────────
export const isLiked = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const like = await ctx.db
      .query("eventLikes")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return !!like;
  },
});

// ─── Get archived events ─────────────────────────────────────────────────────
export const listArchivedEvents = query({
  args: {},
  handler: async (ctx) => {
    const archived = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();

    return await Promise.all(
      archived.map(async (event) => {
        const archive = await ctx.db
          .query("eventArchives")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .unique();
        return { ...event, archive };
      })
    );
  },
});

// ─── Get user events ─────────────────────────────────────────────────────────
export const getUserEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const organizedRoles = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const events = await Promise.all(
      organizedRoles.map(async (or) => {
        const event = await ctx.db.get(or.eventId);
        return event ? { ...event, organizerRole: or.role } : null;
      })
    );

    return events.filter(Boolean);
  },
});
