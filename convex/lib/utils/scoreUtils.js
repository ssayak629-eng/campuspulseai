/**
 * Score utilities for normalization and display
 */

/**
 * Normalize a score to a percentage
 */
export function toPercent(score) {
  return Math.round(Math.min(1, Math.max(0, score)) * 100);
}

/**
 * Get a color class based on score level
 */
export function getScoreColor(score) {
  if (score >= 0.7) return "text-emerald-400";
  if (score >= 0.4) return "text-yellow-400";
  return "text-gray-400";
}

/**
 * Get a label for the match quality
 */
export function getMatchLabel(finalScore) {
  if (finalScore >= 0.75) return "Excellent Match";
  if (finalScore >= 0.55) return "Great Match";
  if (finalScore >= 0.35) return "Good Match";
  return "Suggested";
}
