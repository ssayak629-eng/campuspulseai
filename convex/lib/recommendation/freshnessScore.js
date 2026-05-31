/**
 * Freshness score: boost newly created events.
 * Score decays over time using exponential decay.
 *
 * @param {number} createdAt - Unix timestamp (ms)
 * @returns {number} Score in [0, 1]
 */
export function computeFreshnessScore(createdAt) {
  const ageMs = Date.now() - createdAt;
  const DAY = 86400000;

  if (ageMs < 0) return 1.0;

  // Smooth continuous exponential decay with a 7-day half-life, mapped between 0.05 and 1.0
  const halfLife = 7 * DAY;
  const decay = Math.exp(-ageMs / halfLife);
  return 0.05 + decay * 0.95;
}
