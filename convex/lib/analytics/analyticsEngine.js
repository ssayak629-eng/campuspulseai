/**
 * Analytics engine utilities for computing aggregated metrics.
 */

/**
 * Compute registration rate trend over the last N days
 */
export function computeRegistrationTrend(registrations, days = 7) {
  const now = Date.now();
  const DAY = 86400000;

  return Array.from({ length: days }, (_, i) => {
    const dayStart = now - (days - 1 - i) * DAY;
    const dayEnd = dayStart + DAY;
    const count = registrations.filter(
      (r) => r.registeredAt >= dayStart && r.registeredAt < dayEnd
    ).length;
    return {
      day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
      date: new Date(dayStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      registrations: count,
    };
  });
}

/**
 * Compute hourly distribution of check-ins
 */
export function computeCheckinDistribution(attendance) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    count: 0,
  }));

  for (const a of attendance) {
    const hour = new Date(a.checkedInAt).getHours();
    hours[hour].count++;
  }

  return hours;
}

/**
 * Compute per-event performance scores for ranking
 */
export function computeEventPerformanceScore(event, registrationCount, attendanceCount) {
  const attendanceRate = registrationCount > 0 ? attendanceCount / registrationCount : 0;
  const engagementScore = (event.likeCount ?? 0) + (event.viewCount ?? 0) * 0.1;

  return {
    attendanceRate: Math.round(attendanceRate * 100),
    engagementScore: Math.round(engagementScore),
    overallScore: Math.round(attendanceRate * 50 + Math.min(engagementScore, 100) * 0.5),
  };
}
