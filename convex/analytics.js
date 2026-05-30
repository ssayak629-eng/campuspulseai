import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Record interaction ───────────────────────────────────────────────────────
export const recordInteraction = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    interactionType: v.union(
      v.literal("viewed"),
      v.literal("clicked"),
      v.literal("shared"),
      v.literal("bookmarked")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("eventInteractions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ─── Get event analytics ──────────────────────────────────────────────────────
export const getEventAnalytics = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const [event, registrations, attendance, likes, interactions] =
      await Promise.all([
        ctx.db.get(eventId),
        ctx.db
          .query("registrations")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect(),
        ctx.db
          .query("attendance")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect(),
        ctx.db
          .query("eventLikes")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect(),
        ctx.db
          .query("eventInteractions")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect(),
      ]);

    const interactionByType = interactions.reduce((acc, i) => {
      acc[i.interactionType] = (acc[i.interactionType] ?? 0) + 1;
      return acc;
    }, {});

    // Compute registration timeline (last 7 days)
    const now = Date.now();
    const DAY = 86400000;
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * DAY;
      const dayEnd = dayStart + DAY;
      const count = registrations.filter(
        (r) => r.registeredAt >= dayStart && r.registeredAt < dayEnd
      ).length;
      return {
        day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        registrations: count,
      };
    });

    return {
      event,
      registrationCount: registrations.length,
      attendanceCount: attendance.length,
      likeCount: likes.length,
      viewCount: event?.viewCount ?? 0,
      attendanceRate:
        registrations.length > 0
          ? Math.round((attendance.length / registrations.length) * 100)
          : 0,
      interactions: interactionByType,
      registrationTimeline: timeline,
    };
  },
});

// ─── Get organizer dashboard stats ────────────────────────────────────────────
export const getOrganizerDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const orgRoles = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const eventIds = orgRoles.map((o) => o.eventId);
    const events = await Promise.all(eventIds.map((id) => ctx.db.get(id)));
    const validEvents = events.filter(Boolean);

    const [allRegistrations, allAttendance, allLikes] = await Promise.all([
      Promise.all(
        eventIds.map((id) =>
          ctx.db
            .query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", id))
            .collect()
        )
      ),
      Promise.all(
        eventIds.map((id) =>
          ctx.db
            .query("attendance")
            .withIndex("by_event", (q) => q.eq("eventId", id))
            .collect()
        )
      ),
      Promise.all(
        eventIds.map((id) =>
          ctx.db
            .query("eventLikes")
            .withIndex("by_event", (q) => q.eq("eventId", id))
            .collect()
        )
      ),
    ]);

    const totalRegistrations = allRegistrations.flat().length;
    const totalAttendance = allAttendance.flat().length;
    const totalLikes = allLikes.flat().length;

    return {
      totalEvents: validEvents.length,
      activeEvents: validEvents.filter((e) => !e.isArchived).length,
      totalRegistrations,
      totalAttendance,
      totalLikes,
      totalViews: validEvents.reduce((sum, e) => sum + (e.viewCount ?? 0), 0),
      events: validEvents.map((e, i) => ({
        ...e,
        registrationCount: allRegistrations[i].length,
        attendanceCount: allAttendance[i].length,
      })),
    };
  },
});

// ─── Get trending categories ──────────────────────────────────────────────────
export const getTrendingCategories = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const categoryStats = {};

    for (const event of events) {
      const cat = event.category;
      if (!categoryStats[cat]) {
        categoryStats[cat] = { name: cat, views: 0, registrations: 0, likes: 0 };
      }
      categoryStats[cat].views += event.viewCount ?? 0;
      categoryStats[cat].registrations += event.registrationCount ?? 0;
      categoryStats[cat].likes += event.likeCount ?? 0;
    }

    return Object.values(categoryStats)
      .map((c) => ({
        ...c,
        score: c.views + c.registrations * 3 + c.likes * 2,
      }))
      .sort((a, b) => b.score - a.score);
  },
});

// ─── Get recommendation CTR ───────────────────────────────────────────────────
export const getRecommendationCTR = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const [views, clicks] = await Promise.all([
      ctx.db
        .query("eventInteractions")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("interactionType"), "viewed"))
        .collect(),
      ctx.db
        .query("eventInteractions")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("interactionType"), "clicked"))
        .collect(),
    ]);

    return {
      views: views.length,
      clicks: clicks.length,
      ctr: views.length > 0 ? (clicks.length / views.length) * 100 : 0,
    };
  },
});
