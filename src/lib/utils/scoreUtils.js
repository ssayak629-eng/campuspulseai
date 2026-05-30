/**
 * Score display utilities — frontend version
 */

export function toPercent(score) {
  return Math.round(Math.min(1, Math.max(0, score ?? 0)) * 100);
}

export function getScoreColor(score) {
  if (score >= 0.7) return "text-emerald-400";
  if (score >= 0.4) return "text-yellow-400";
  return "text-gray-400";
}

export function getMatchLabel(finalScore) {
  if (finalScore >= 0.75) return "Excellent Match";
  if (finalScore >= 0.55) return "Great Match";
  if (finalScore >= 0.35) return "Good Match";
  return "Suggested";
}
