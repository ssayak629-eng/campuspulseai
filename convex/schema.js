import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ──────────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("organizer"),
      v.literal("volunteer"),
      v.literal("admin")
    ),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
    onboardingComplete: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ─── Events ─────────────────────────────────────────────────────────────────
  events: defineTable({
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
    embedding: v.optional(v.array(v.float64())),
    createdBy: v.id("users"),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    registrationCount: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_created_by", ["createdBy"])
    .index("by_category", ["category"])
    .index("by_archived", ["isArchived"])
    .index("by_start_date", ["startDate"]),

  // ─── Event Organizers ────────────────────────────────────────────────────────
  eventOrganizers: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("organizer"),
      v.literal("volunteer")
    ),
    addedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  // ─── Teams ───────────────────────────────────────────────────────────────────
  teams: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    maxMembers: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_created_by", ["createdBy"]),

  // ─── Team Members ────────────────────────────────────────────────────────────
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    joinedAt: v.number(),
    status: v.optional(v.string()), // "accepted", "pending"
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // ─── Friendships ─────────────────────────────────────────────────────────────
  friendships: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),

  // ─── Registrations ───────────────────────────────────────────────────────────
  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    qrToken: v.optional(v.string()),
    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_qr_token", ["qrToken"]),

  // ─── Event Likes ─────────────────────────────────────────────────────────────
  eventLikes: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    likedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  // ─── Event Interactions ──────────────────────────────────────────────────────
  eventInteractions: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    interactionType: v.union(
      v.literal("viewed"),
      v.literal("clicked"),
      v.literal("shared"),
      v.literal("bookmarked")
    ),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_type", ["interactionType"]),

  // ─── Attendance ──────────────────────────────────────────────────────────────
  attendance: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    checkedInAt: v.number(),
    qrToken: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_qr_token", ["qrToken"]),

  // ─── Notifications ───────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("registration"),
      v.literal("organizer_invite"),
      v.literal("recommendation"),
      v.literal("event_reminder"),
      v.literal("team_invite"),
      v.literal("friend"),
      v.literal("general")
    ),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  // ─── Event Archives ──────────────────────────────────────────────────────────
  eventArchives: defineTable({
    eventId: v.id("events"),
    attendanceCount: v.number(),
    photos: v.optional(v.array(v.string())),
    recordings: v.optional(v.array(v.string())),
    feedbackScore: v.optional(v.float64()),
    archivedAt: v.number(),
  }).index("by_event", ["eventId"]),
});
