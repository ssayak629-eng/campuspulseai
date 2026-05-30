import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Create team ─────────────────────────────────────────────────────────────
export const createTeam = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    maxMembers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      ...args,
      createdAt: Date.now(),
    });

    // Creator joins automatically
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.createdBy,
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

// ─── Join team ────────────────────────────────────────────────────────────────
export const joinTeam = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", teamId).eq("userId", userId)
      )
      .unique();
    if (existing) return existing._id;

    // Check capacity
    if (team.maxMembers) {
      const members = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      if (members.length >= team.maxMembers) {
        throw new Error("Team is full");
      }
    }

    return await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      joinedAt: Date.now(),
    });
  },
});

// ─── Leave team ───────────────────────────────────────────────────────────────
export const leaveTeam = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", teamId).eq("userId", userId)
      )
      .unique();
    if (membership) await ctx.db.delete(membership._id);
  },
});

// ─── Get event teams ──────────────────────────────────────────────────────────
export const getEventTeams = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    return await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const membersWithUsers = await Promise.all(
          members.map(async (m) => {
            const user = await ctx.db.get(m.userId);
            return { ...m, user };
          })
        );

        return { ...team, members: membersWithUsers };
      })
    );
  },
});

// ─── Get user's team for event ────────────────────────────────────────────────
export const getUserTeam = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    for (const team of teams) {
      const membership = await ctx.db
        .query("teamMembers")
        .withIndex("by_team_user", (q) =>
          q.eq("teamId", team._id).eq("userId", userId)
        )
        .unique();
      if (membership) {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        const membersWithUsers = await Promise.all(
          members.map(async (m) => ({ ...m, user: await ctx.db.get(m.userId) }))
        );
        return { ...team, members: membersWithUsers };
      }
    }
    return null;
  },
});

// ─── Invite member to team ────────────────────────────────────────────────────
export const inviteMember = mutation({
  args: {
    teamId: v.id("teams"),
    targetUserId: v.id("users"),
    invitingUserId: v.id("users"),
  },
  handler: async (ctx, { teamId, targetUserId, invitingUserId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");

    // Send notification
    await ctx.db.insert("notifications", {
      userId: targetUserId,
      title: "Team Invite",
      message: `You've been invited to join team "${team.name}".`,
      type: "team_invite",
      isRead: false,
      relatedId: teamId,
      createdAt: Date.now(),
    });

    return true;
  },
});

// ─── Get team by ID ───────────────────────────────────────────────────────────
export const getTeamById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) return null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (m) => ({ ...m, user: await ctx.db.get(m.userId) }))
    );

    return { ...team, members: membersWithUsers };
  },
});
