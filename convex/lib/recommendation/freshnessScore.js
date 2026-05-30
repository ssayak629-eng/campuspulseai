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

  if (ageMs <= DAY) return 1.0;           // Created today: max freshness
  if (ageMs <= 3 * DAY) return 0.8;      // 1–3 days old
  if (ageMs <= 7 * DAY) return 0.6;      // 3–7 days old
  if (ageMs <= 14 * DAY) return 0.4;     // 1–2 weeks old
  if (ageMs <= 30 * DAY) return 0.2;     // 2–4 weeks old

  return 0.05; // older than a month
}
