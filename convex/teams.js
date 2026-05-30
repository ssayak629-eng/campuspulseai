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
    invites: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.createdBy);
    if (!creator) throw new Error("Creator user not found");

    const teamId = await ctx.db.insert("teams", {
      eventId: args.eventId,
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
      maxMembers: args.maxMembers,
      createdAt: Date.now(),
    });

    // Creator joins automatically as accepted
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.createdBy,
      joinedAt: Date.now(),
      status: "accepted",
    });

    // Handle initial invites/members by email or username (name)
    if (args.invites && args.invites.length > 0) {
      const allUsers = await ctx.db.query("users").collect();
      let addedCount = 1; // Start with creator

      for (const inviteInput of args.invites) {
        const cleaned = inviteInput.trim().toLowerCase();
        if (!cleaned) continue;

        // Find user by email or name match
        const matchedUser = allUsers.find(
          (u) => 
            u.email.toLowerCase() === cleaned || 
            u.name.toLowerCase() === cleaned
        );

        if (matchedUser && matchedUser._id !== args.createdBy) {
          // Check capacity limit
          if (args.maxMembers && addedCount >= args.maxMembers) {
            break; // Stop adding if we hit capacity
          }

          // Insert team member as PENDING (must accept)
          await ctx.db.insert("teamMembers", {
            teamId,
            userId: matchedUser._id,
            joinedAt: Date.now(),
            status: "pending",
          });
          addedCount++;

          // Send notification
          await ctx.db.insert("notifications", {
            userId: matchedUser._id,
            title: "Team Invitation",
            message: `${creator.name} invited you to join the team "${args.name}". Please accept the invitation.`,
            type: "team_invite",
            isRead: false,
            relatedId: teamId,
            createdAt: Date.now(),
          });
        }
      }
    }

    return teamId;
  },
});

// ─── Join team directly ───────────────────────────────────────────────────────
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
    
    if (existing) {
      if (existing.status === "pending") {
        // Automatically accept invitation if they try to join
        await ctx.db.patch(existing._id, { status: "accepted" });
        return existing._id;
      }
      return existing._id;
    }

    // Check capacity (counting both accepted and pending reservations)
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
      status: "accepted",
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
      if (membership && membership.status === "accepted") {
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

// ─── Invite member to team (sets status to pending) ───────────────────────────
export const inviteMember = mutation({
  args: {
    teamId: v.id("teams"),
    targetUserId: v.id("users"),
    invitingUserId: v.id("users"),
  },
  handler: async (ctx, { teamId, targetUserId, invitingUserId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", targetUserId))
      .unique();

    if (existing) {
      if (existing.status === "accepted") throw new Error("User is already in this team");
      return false; // Already pending
    }

    // Insert pending teammate membership
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: targetUserId,
      joinedAt: Date.now(),
      status: "pending",
    });

    const inviter = await ctx.db.get(invitingUserId);

    // Send notification
    await ctx.db.insert("notifications", {
      userId: targetUserId,
      title: "Team Invitation",
      message: `${inviter?.name || "A peer"} invited you to join the team "${team.name}".`,
      type: "team_invite",
      isRead: false,
      relatedId: teamId,
      createdAt: Date.now(),
    });

    return true;
  },
});

// ─── Request to join friend's team ────────────────────────────────────────────
export const requestToJoinTeam = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
      .unique();

    if (existing) throw new Error("You have already joined or requested this team");

    // Insert as requested
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      joinedAt: Date.now(),
      status: "requested",
    });

    const requester = await ctx.db.get(userId);

    // Notify the team creator
    await ctx.db.insert("notifications", {
      userId: team.createdBy,
      title: "Join Request",
      message: `${requester?.name || "A peer"} has requested to join your team "${team.name}".`,
      type: "team_invite",
      isRead: false,
      relatedId: teamId,
      createdAt: Date.now(),
    });

    return true;
  },
});

// ─── Accept team membership (for pending invites or join requests) ────────────
export const acceptTeamMembership = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
      .unique();

    if (!membership) throw new Error("Membership request not found");
    
    await ctx.db.patch(membership._id, { status: "accepted" });
    return true;
  },
});

// ─── Decline/Reject team membership invitation or request ─────────────────────
export const declineTeamMembership = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
      return true;
    }
    return false;
  },
});

// ─── Get pending invitations & requests for a user ────────────────────────────
export const getPendingInvitations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // 1. Invitations sent to this user (where user is target and status is pending)
    const pendingInvites = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitesWithDetails = await Promise.all(
      pendingInvites.map(async (p) => {
        const team = await ctx.db.get(p.teamId);
        const event = team ? await ctx.db.get(team.eventId) : null;
        const inviter = team ? await ctx.db.get(team.createdBy) : null;
        return { ...p, team, event, inviter, type: "invite" };
      })
    );

    // 2. Join requests sent to teams created by this user (where status is requested)
    const myTeams = await ctx.db
      .query("teams")
      .withIndex("by_created_by", (q) => q.eq("createdBy", userId))
      .collect();

    const requestsWithDetails = [];
    for (const team of myTeams) {
      const requests = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .filter((q) => q.eq(q.field("status"), "requested"))
        .collect();

      for (const req of requests) {
        const requester = await ctx.db.get(req.userId);
        const event = await ctx.db.get(team.eventId);
        requestsWithDetails.push({
          ...req,
          team,
          event,
          requester,
          type: "request",
        });
      }
    }

    return [...invitesWithDetails, ...requestsWithDetails];
  },
});

// ─── Get friends' incomplete teams for an event ─────────────────────────────────
export const getFriendsIncompleteTeams = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, { eventId, userId }) => {
    // 1. Get user's friends
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

    const friendIds = new Set([
      ...asUser1.map((f) => f.user2),
      ...asUser2.map((f) => f.user1),
    ]);

    if (friendIds.size === 0) return [];

    // 2. Get event teams
    const eventTeams = await ctx.db
      .query("teams")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    const results = [];

    for (const team of eventTeams) {
      const members = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();

      // Only count accepted members as occupied slots
      const acceptedMembers = members.filter((m) => !m.status || m.status === "accepted");
      const memberUserIds = acceptedMembers.map((m) => m.userId);

      // Skip if user is already a member
      const userMembership = members.find((m) => m.userId === userId);
      if (userMembership && userMembership.status === "accepted") continue;

      // Skip if full
      if (team.maxMembers && acceptedMembers.length >= team.maxMembers) continue;

      // Find friends in this team
      const friendsInTeam = [];
      const allMembersUserIds = members.map((m) => m.userId);
      for (const mId of allMembersUserIds) {
        if (friendIds.has(mId)) {
          const friendUser = await ctx.db.get(mId);
          if (friendUser) friendsInTeam.push(friendUser);
        }
      }

      if (friendsInTeam.length > 0) {
        const creator = await ctx.db.get(team.createdBy);
        results.push({
          ...team,
          creator,
          membersCount: acceptedMembers.length,
          friends: friendsInTeam,
          requestedStatus: userMembership ? userMembership.status : null, // e.g. "requested", "pending"
        });
      }
    }

    return results;
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

// ─── Invite teammate later by email or name ──────────────────────────────────
export const inviteTeammateByEmailOrName = mutation({
  args: {
    teamId: v.id("teams"),
    invitingUserId: v.id("users"),
    inviteInput: v.string(),
  },
  handler: async (ctx, { teamId, invitingUserId, inviteInput }) => {
    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");

    const inviter = await ctx.db.get(invitingUserId);
    if (!inviter) throw new Error("Inviter user not found");

    const cleaned = inviteInput.trim().toLowerCase();
    if (!cleaned) throw new Error("Please enter a valid email or name");

    const allUsers = await ctx.db.query("users").collect();
    const matchedUser = allUsers.find(
      (u) => 
        u.email.toLowerCase() === cleaned || 
        u.name.toLowerCase() === cleaned
    );

    if (!matchedUser) throw new Error(`User "${inviteInput}" not found on campus.`);
    if (matchedUser._id === invitingUserId) throw new Error("You cannot invite yourself.");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", matchedUser._id))
      .unique();

    if (existing) {
      if (existing.status === "accepted") throw new Error("User is already in this team");
      throw new Error("Invitation is already pending.");
    }

    // Insert pending teammate membership
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: matchedUser._id,
      joinedAt: Date.now(),
      status: "pending",
    });

    // Send notification
    await ctx.db.insert("notifications", {
      userId: matchedUser._id,
      title: "Team Invitation",
      message: `${inviter.name} invited you to join the team "${team.name}".`,
      type: "team_invite",
      isRead: false,
      relatedId: teamId,
      createdAt: Date.now(),
    });

    return true;
  },
});

// ─── Get all teams for a user (accepted, pending, requested) ──────────────────
export const getUserAllTeams = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const teamsWithDetails = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;
        const event = await ctx.db.get(team.eventId);
        const creator = await ctx.db.get(team.createdBy);

        // Fetch all members of this team
        const allMembers = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const membersWithUsers = await Promise.all(
          allMembers.map(async (m) => {
            const user = await ctx.db.get(m.userId);
            return { ...m, user };
          })
        );

        return {
          ...team,
          event,
          creator,
          userStatus: membership.status || "accepted", // "accepted", "pending", "requested"
          joinedAt: membership.joinedAt,
          members: membersWithUsers,
        };
      })
    );

    return teamsWithDetails.filter(Boolean);
  },
});

