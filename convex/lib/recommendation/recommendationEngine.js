import { computeSemanticScore } from "./semanticScore.js";
import { computeSocialScore } from "./socialScore.js";
import { computeTrendScore, computePlatformAverages } from "./trendScore.js";
import { computeDeadlineScore } from "./deadlineScore.js";
import { computeFreshnessScore } from "./freshnessScore.js";
import { computeFinalScore } from "./finalScore.js";
import { generateExplanation } from "./explanationGenerator.js";

/**
 * Main recommendation engine.
 * Computes scores for each active event relative to the user.
 *
 * @param {Object} user - User object with embedding, interests, skills
 * @param {Object[]} events - Active events with embedding
 * @param {string[]} friendIds - Friend user IDs
 * @param {Object} eventFriendActivityMap - Map of eventId → { registered, liked, attended }
 * @param {number} topN - How many results to return
 * @returns {Object[]} Sorted recommended events with scores and explanations
 */
export function runRecommendationEngine(
  user,
  events,
  friendIds,
  eventFriendActivityMap,
  topN = 10
) {
  if (!events || events.length === 0) return [];

  const platformAverages = computePlatformAverages(events);
  const DAY = 86400000;

  const scored = events.map((event) => {
    const eventActivity = eventFriendActivityMap[event._id] ?? {
      registered: [],
      liked: [],
      attended: [],
    };

    const semantic = computeSemanticScore(user.embedding, event.embedding, user, event);
    const social = computeSocialScore(friendIds, eventActivity);
    const trend = computeTrendScore(event, platformAverages);
    const deadline = computeDeadlineScore(event.registrationDeadline);
    const freshness = computeFreshnessScore(event.createdAt);

    const scores = { semantic, social, trend, deadline, freshness };
    const finalScore = computeFinalScore(scores);

    // Build context for explanation
    const friendsRegistered = eventActivity.registered.filter((id) =>
      friendIds.includes(id)
    ).length;
    const friendsLiked = eventActivity.liked.filter((id) =>
      friendIds.includes(id)
    ).length;
    const friendsAttended = eventActivity.attended.filter((id) =>
      friendIds.includes(id)
    ).length;

    const context = {
      user,
      event,
      friendsRegistered,
      friendsLiked,
      friendsAttended,
      matchedInterests: (user.interests ?? []).filter((interest) =>
        event.tags?.some((tag) =>
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      ),
      matchedSkills: (user.skills ?? []).filter((skill) =>
        event.description?.toLowerCase().includes(skill.toLowerCase())
      ),
      attendedSimilarEvents: [],
      isNew: Date.now() - event.createdAt < DAY,
      deadlineSoon: event.registrationDeadline - Date.now() < 3 * DAY,
      isTrending: trend >= 0.6,
    };

    const explanation = generateExplanation(scores, context);

    return {
      event,
      scores,
      finalScore,
      explanation,
    };
  });

  return scored
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topN);
}
