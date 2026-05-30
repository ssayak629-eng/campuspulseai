import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Check in via QR token ───────────────────────────────────────────────────
export const checkInByQR = mutation({
  args: { qrToken: v.string() },
  handler: async (ctx, { qrToken }) => {
    // Look up registration by QR token
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_token", (q) => q.eq("qrToken", qrToken))
      .unique();

    if (!registration) throw new Error("Invalid QR token");

    // Check if already checked in
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", registration.eventId).eq("userId", registration.userId)
      )
      .unique();

    if (existing) {
      return { success: false, message: "Already checked in", attendance: existing };
    }

    const attendanceId = await ctx.db.insert("attendance", {
      eventId: registration.eventId,
      userId: registration.userId,
      checkedInAt: Date.now(),
      qrToken,
    });

    const user = await ctx.db.get(registration.userId);
    const event = await ctx.db.get(registration.eventId);

    return {
      success: true,
      message: `Welcome, ${user?.name ?? "attendee"}!`,
      attendanceId,
      user,
      event,
    };
  },
});

// ─── Manual check-in ─────────────────────────────────────────────────────────
export const manualCheckIn = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    operatorUserId: v.id("users"),
  },
  handler: async (ctx, { eventId, userId, operatorUserId }) => {
    // Verify operator is an organizer/volunteer
    const operator = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", operatorUserId)
      )
      .unique();

    if (!operator) throw new Error("Not authorized to check in attendees");

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();

    if (existing) return { success: false, message: "Already checked in" };

    const qrToken = `manual-${eventId}-${userId}-${Date.now()}`;
    const attendanceId = await ctx.db.insert("attendance", {
      eventId,
      userId,
      checkedInAt: Date.now(),
      qrToken,
    });

    return { success: true, attendanceId };
  },
});

// ─── Get event attendance ─────────────────────────────────────────────────────
export const getEventAttendance = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    return await Promise.all(
      records.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return { ...r, user };
      })
    );
  },
});

// ─── Get user attendance history ─────────────────────────────────────────────
export const getUserAttendance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      records.map(async (r) => {
        const event = await ctx.db.get(r.eventId);
        return { ...r, event };
      })
    );
  },
});

// ─── Check if user is checked in ─────────────────────────────────────────────
export const isCheckedIn = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const record = await ctx.db
      .query("attendance")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return !!record;
  },
});

// ─── Verify QR token (non-destructive check) ─────────────────────────────────
export const verifyQRToken = query({
  args: { qrToken: v.string() },
  handler: async (ctx, { qrToken }) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_token", (q) => q.eq("qrToken", qrToken))
      .unique();

    if (!registration) return { valid: false };

    const user = await ctx.db.get(registration.userId);
    const event = await ctx.db.get(registration.eventId);
    const checkedIn = await ctx.db
      .query("attendance")
      .withIndex("by_event_user", (q) =>
        q
          .eq("eventId", registration.eventId)
          .eq("userId", registration.userId)
      )
      .unique();

    return { valid: true, user, event, checkedIn: !!checkedIn };
  },
});
