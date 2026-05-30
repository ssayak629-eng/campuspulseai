import { v } from "convex/values";
import { query } from "./_generated/server";

// ─── Get archive for event ────────────────────────────────────────────────────
export const getArchive = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("eventArchives")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .unique();
  },
});

// ─── List all archives ────────────────────────────────────────────────────────
export const listArchives = query({
  args: {},
  handler: async (ctx) => {
    const archives = await ctx.db.query("eventArchives").order("desc").collect();

    return await Promise.all(
      archives.map(async (archive) => {
        const event = await ctx.db.get(archive.eventId);
        return { ...archive, event };
      })
    );
  },
});
