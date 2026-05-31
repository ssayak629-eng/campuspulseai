/**
 * Deadline score: higher when registration deadline is approaching.
 * Score rises steeply in the final 3 days.
 *
 * @param {number} registrationDeadline - Unix timestamp (ms)
 * @returns {number} Score in [0, 1]
 */
export function computeDeadlineScore(registrationDeadline) {
  const now = Date.now();
  const timeLeft = registrationDeadline - now;

  if (timeLeft <= 0) return 0; // Registration closed

  const DAY = 86400000;
  const WEEK = 7 * DAY;

  if (timeLeft <= DAY) return 1.0;         // < 1 day: max urgency

  // Continuous decay using a 1/(1+(days/k)^p) curve
  const totalDays = timeLeft / DAY;
  const k = 3; // shape parameter (steepness)
  const p = 2; // curvature
  return 1 / (1 + Math.pow(totalDays / k, p));
}
