/**
 * Generate a human-readable explanation for why an event was recommended.
 * Returns an array of explanation strings.
 */
export function generateExplanation(scores, context) {
  const { semantic, social, trend, deadline, freshness } = scores;
  const {
    user = null,
    event = null,
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

  let reason = "";

  // 1. Prior attendance history match
  if (attendedSimilarEvents.length > 0) {
    reason = `You would like this because it is similar to "${attendedSimilarEvents[0]}" which you attended!`;
  }
  // 2. Direct user interest match
  else if (matchedInterests.length > 0) {
    reason = `You'd love this because it perfectly matches your passion for ${matchedInterests[0]}!`;
  }
  // 3. Direct user skill match
  else if (matchedSkills.length > 0) {
    reason = `You would like this because it is a great way to grow your ${matchedSkills[0]} skills!`;
  }
  // 4. Friend activity/social match
  else if (friendsRegistered > 0 || friendsLiked > 0) {
    reason = `You would like this because your campus friends are already registered and going!`;
  }
  // 5. Default Fallback
  else {
    reason = "You might like this";
  }

  // Ensure it is under 20 words and returned as a single-element array for React compatibility
  const words = reason.split(/\s+/).slice(0, 20).join(" ");
  return [words];
}
