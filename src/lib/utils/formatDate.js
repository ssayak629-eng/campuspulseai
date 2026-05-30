/**
 * Date utility functions for CampusPulseAI — frontend version
 */

export function formatDate(timestamp, options = {}) {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = timestamp - Date.now();
  const abs = Math.abs(diff);
  const isPast = diff < 0;

  const MINUTE = 60000;
  const HOUR = 3600000;
  const DAY = 86400000;
  const WEEK = 7 * DAY;

  let label;
  if (abs < MINUTE) label = "just now";
  else if (abs < HOUR) label = `${Math.floor(abs / MINUTE)} min`;
  else if (abs < DAY) label = `${Math.floor(abs / HOUR)} hour${Math.floor(abs / HOUR) !== 1 ? "s" : ""}`;
  else if (abs < WEEK) label = `${Math.floor(abs / DAY)} day${Math.floor(abs / DAY) !== 1 ? "s" : ""}`;
  else label = `${Math.floor(abs / WEEK)} week${Math.floor(abs / WEEK) !== 1 ? "s" : ""}`;

  if (abs < MINUTE) return label;
  return isPast ? `${label} ago` : `in ${label}`;
}

export function isDeadlinePassed(deadline) {
  return deadline < Date.now();
}

export function getDaysUntilDeadline(deadline) {
  const diff = deadline - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}
