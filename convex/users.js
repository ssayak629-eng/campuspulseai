import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Get user by Clerk ID ────────────────────────────────────────────────────
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

// ─── Get user by ID ──────────────────────────────────────────────────────────
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// ─── Get current user from Clerk identity ───────────────────────────────────
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// ─── Create user ────────────────────────────────────────────────────────────
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("organizer"),
        v.literal("volunteer"),
        v.literal("admin")
      )
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: args.role ?? "student",
      interests: [],
      skills: [],
      onboardingComplete: false,
      createdAt: Date.now(),
    });
  },
});

// ─── Complete onboarding ─────────────────────────────────────────────────────
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    department: v.string(),
    year: v.string(),
    interests: v.array(v.string()),
    skills: v.array(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("organizer"),
      v.literal("volunteer"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      department: args.department,
      year: args.year,
      interests: args.interests,
      skills: args.skills,
      role: args.role,
      onboardingComplete: true,
    });
  },
});

// ─── Update user ─────────────────────────────────────────────────────────────
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("organizer"),
        v.literal("volunteer"),
        v.literal("admin")
      )
    ),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(userId, filtered);
  },
});

// ─── Update user embedding ───────────────────────────────────────────────────
export const updateUserEmbedding = mutation({
  args: {
    userId: v.id("users"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, { userId, embedding }) => {
    await ctx.db.patch(userId, { embedding });
  },
});

// ─── Get user with stats ─────────────────────────────────────────────────────
export const getUserWithStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const [registrations, attended, likes] = await Promise.all([
      ctx.db
        .query("registrations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("attendance")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("eventLikes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    return {
      ...user,
      stats: {
        registrationsCount: registrations.length,
        attendedCount: attended.length,
        likesCount: likes.length,
      },
    };
  },
});

// ─── Search users ────────────────────────────────────────────────────────────
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const all = await ctx.db.query("users").collect();
    const q = query.toLowerCase();
    return all
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
      .slice(0, 10);
  },
});
