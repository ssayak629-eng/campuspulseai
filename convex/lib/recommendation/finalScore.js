/**
 * Compute the final weighted recommendation score.
 *
 * Formula:
 *   Score = 0.5 * Semantic
 *         + 0.2 * Social
 *         + 0.1 * Trend
 *         + 0.1 * Deadline
 *         + 0.1 * Freshness
 */
export function computeFinalScore(scores) {
  const { semantic = 0, social = 0, trend = 0, deadline = 0, freshness = 0 } = scores;

  return (
    0.5 * semantic +
    0.2 * social +
    0.1 * trend +
    0.1 * deadline +
    0.1 * freshness
  );
}
