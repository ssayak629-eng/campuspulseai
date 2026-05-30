import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Get event organizers ────────────────────────────────────────────────────
export const getEventOrganizers = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const organizers = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    return await Promise.all(
      organizers.map(async (o) => {
        const user = await ctx.db.get(o.userId);
        return { ...o, user };
      })
    );
  },
});

// ─── Get user's role for an event ───────────────────────────────────────────
export const getUserOrganizerRole = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const record = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return record?.role ?? null;
  },
});

// ─── Check if user is organizer ──────────────────────────────────────────────
export const isOrganizer = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const record = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return !!record;
  },
});

// ─── Add organizer ───────────────────────────────────────────────────────────
export const addOrganizer = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.union(
      v.literal("organizer"),
      v.literal("volunteer"),
      v.literal("owner")
    ),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, { eventId, userId, role, requestingUserId }) => {
    // Only owners can add organizers
    const requester = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", requestingUserId)
      )
      .unique();

    if (!requester || requester.role !== "owner") {
      throw new Error("Only event owners can add organizers");
    }

    const existing = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role });
      return existing._id;
    }

    const id = await ctx.db.insert("eventOrganizers", {
      eventId,
      userId,
      role,
      addedAt: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Organizer Invite",
      message: `You've been added as a ${role} for an event.`,
      type: "organizer_invite",
      isRead: false,
      relatedId: eventId,
      createdAt: Date.now(),
    });

    return id;
  },
});

// ─── Remove organizer ────────────────────────────────────────────────────────
export const removeOrganizer = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, { eventId, userId, requestingUserId }) => {
    const requester = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", requestingUserId)
      )
      .unique();

    if (!requester || requester.role !== "owner") {
      throw new Error("Only owners can remove organizers");
    }

    const target = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();

    if (!target) throw new Error("User is not an organizer");
    if (target.role === "owner") throw new Error("Cannot remove the event owner");

    await ctx.db.delete(target._id);
  },
});
