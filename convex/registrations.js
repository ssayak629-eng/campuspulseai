import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Register for event ──────────────────────────────────────────────────────
export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, { eventId, userId, teamId }) => {
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    if (existing) return existing._id;

    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    if (event.registrationDeadline < Date.now()) {
      throw new Error("Registration deadline has passed");
    }

    // Check capacity
    if (event.maxParticipants) {
      const current = await ctx.db
        .query("registrations")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      if (current.length >= event.maxParticipants) {
        throw new Error("Event is at full capacity");
      }
    }

    // Generate unique QR token
    const qrToken = `${eventId}-${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const regId = await ctx.db.insert("registrations", {
      eventId,
      userId,
      teamId,
      qrToken,
      registeredAt: Date.now(),
    });

    // Increment event registration count
    await ctx.db.patch(eventId, {
      registrationCount: (event.registrationCount ?? 0) + 1,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId,
      title: "Registration Confirmed! 🎉",
      message: `You're registered for "${event.title}". Check your QR code for check-in.`,
      type: "registration",
      isRead: false,
      relatedId: eventId,
      createdAt: Date.now(),
    });

    return regId;
  },
});

// ─── Unregister from event ───────────────────────────────────────────────────
export const unregisterFromEvent = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    if (!reg) return;

    await ctx.db.delete(reg._id);

    const event = await ctx.db.get(eventId);
    if (event) {
      await ctx.db.patch(eventId, {
        registrationCount: Math.max((event.registrationCount ?? 1) - 1, 0),
      });
    }
  },
});

// ─── Get event registrations ─────────────────────────────────────────────────
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    return await Promise.all(
      regs.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return { ...r, user };
      })
    );
  },
});

// ─── Get user registrations ──────────────────────────────────────────────────
export const getUserRegistrations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      regs.map(async (r) => {
        const event = await ctx.db.get(r.eventId);
        return { ...r, event };
      })
    );
  },
});

// ─── Check if registered ─────────────────────────────────────────────────────
export const isRegistered = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return reg ?? null;
  },
});

// ─── Get registration QR token ───────────────────────────────────────────────
export const getRegistrationQR = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return reg?.qrToken ?? null;
  },
});
