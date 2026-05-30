import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Create friendship (called after event archive) ──────────────────────────
export const createFriendship = mutation({
  args: { user1: v.id("users"), user2: v.id("users") },
  handler: async (ctx, { user1, user2 }) => {
    // Normalize order for dedup
    const [u1, u2] = [user1, user2].sort();

    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", u1))
      .filter((q) => q.eq(q.field("user2"), u2))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("friendships", {
      user1: u1,
      user2: u2,
      createdAt: Date.now(),
    });
  },
});

// ─── Get friends list ─────────────────────────────────────────────────────────
export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [asUser1, asUser2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user1", (q) => q.eq("user1", userId))
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user2", (q) => q.eq("user2", userId))
        .collect(),
    ]);

    const friendIds = [
      ...asUser1.map((f) => f.user2),
      ...asUser2.map((f) => f.user1),
    ];

    return await Promise.all(friendIds.map((id) => ctx.db.get(id)));
  },
});

// ─── Get friend IDs ───────────────────────────────────────────────────────────
export const getFriendIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [asUser1, asUser2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user1", (q) => q.eq("user1", userId))
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user2", (q) => q.eq("user2", userId))
        .collect(),
    ]);

    return [
      ...asUser1.map((f) => f.user2),
      ...asUser2.map((f) => f.user1),
    ];
  },
});

// ─── Check if two users are friends ──────────────────────────────────────────
export const areFriends = query({
  args: { user1: v.id("users"), user2: v.id("users") },
  handler: async (ctx, { user1, user2 }) => {
    const [u1, u2] = [user1, user2].sort();
    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", u1))
      .filter((q) => q.eq(q.field("user2"), u2))
      .unique();
    return !!friendship;
  },
});

// ─── Remove friendship ────────────────────────────────────────────────────────
export const removeFriendship = mutation({
  args: { user1: v.id("users"), user2: v.id("users") },
  handler: async (ctx, { user1, user2 }) => {
    const [u1, u2] = [user1, user2].sort();
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", u1))
      .filter((q) => q.eq(q.field("user2"), u2))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});
