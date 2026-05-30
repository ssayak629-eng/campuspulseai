/**
 * Generate a human-readable explanation for why an event was recommended.
 * Returns an array of explanation strings.
 */
export function generateExplanation(scores, context) {
  const reasons = [];

  const { semantic, social, trend, deadline, freshness } = scores;
  const {
    friendsRegistered = 0,
    friendsLiked = 0,
    friendsAttended = 0,
    matchedInterests = [],
    matchedSkills = [],
    attendedSimilarEvents = [],
    isNew = false,
    deadlineSoon = false,
    isTrending = false,
  } = context;

  // Semantic reasons
  if (semantic >= 0.7) {
    if (matchedInterests.length > 0) {
      reasons.push(`Matches your interest in ${matchedInterests.slice(0, 2).join(" and ")}`);
    }
    if (matchedSkills.length > 0) {
      reasons.push(`Relevant to your skills: ${matchedSkills.slice(0, 2).join(", ")}`);
    }
    if (attendedSimilarEvents.length > 0) {
      reasons.push(`Similar to "${attendedSimilarEvents[0]}" which you attended`);
    }
    if (reasons.length === 0) {
      reasons.push("Highly relevant to your profile");
    }
  } else if (semantic >= 0.4) {
    reasons.push("Matches some of your interests");
  }

  // Social reasons
  if (friendsRegistered > 0) {
    reasons.push(
      `${friendsRegistered} friend${friendsRegistered > 1 ? "s" : ""} registered for this`
    );
  }
  if (friendsLiked > 0) {
    reasons.push(
      `${friendsLiked} friend${friendsLiked > 1 ? "s" : ""} liked this event`
    );
  }
  if (friendsAttended > 0) {
    reasons.push(
      `${friendsAttended} friend${friendsAttended > 1 ? "s" : ""} attended this previously`
    );
  }

  // Trend reason
  if (isTrending || trend >= 0.6) {
    reasons.push("Trending in this category");
  }

  // Deadline reason
  if (deadlineSoon || deadline >= 0.7) {
    reasons.push("Registration deadline is approaching soon");
  }

  // Freshness reason
  if (isNew || freshness >= 0.8) {
    reasons.push("Newly added event");
  }

  return reasons.length > 0 ? reasons : ["Recommended based on your campus activity"];
}
