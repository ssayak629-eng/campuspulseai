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
  if (timeLeft <= 2 * DAY) return 0.9;     // 1–2 days
  if (timeLeft <= 3 * DAY) return 0.75;    // 2–3 days
  if (timeLeft <= WEEK) return 0.5;        // within a week
  if (timeLeft <= 2 * WEEK) return 0.25;   // within 2 weeks

  return 0.1; // far away
}
