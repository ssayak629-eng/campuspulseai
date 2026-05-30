/**
 * Social score: based on friend activity for the event.
 * Uses logarithmic scaling to prevent extreme values.
 *
 * @param {string[]} friendIds - Array of friend user IDs
 * @param {Object} eventFriendActivity - { registered: string[], liked: string[], attended: string[] }
 * @returns {number} Score in [0, 1]
 */
export function computeSocialScore(friendIds, eventFriendActivity) {
  if (!friendIds || friendIds.length === 0) return 0;

  const { registered = [], liked = [], attended = [] } = eventFriendActivity;
  const friendSet = new Set(friendIds.map(String));

  const friendsRegistered = registered.filter((id) => friendSet.has(String(id))).length;
  const friendsLiked = liked.filter((id) => friendSet.has(String(id))).length;
  const friendsAttended = attended.filter((id) => friendSet.has(String(id))).length;

  // Weighted social signal
  const rawSignal =
    friendsRegistered * 3 + friendsLiked * 2 + friendsAttended * 4;

  if (rawSignal === 0) return 0;

  // Log scale: log(1 + x) / log(1 + maxExpected)
  const maxExpected = 20; // assume up to ~10 friends doing each action
  return Math.min(1, Math.log1p(rawSignal) / Math.log1p(maxExpected));
}
