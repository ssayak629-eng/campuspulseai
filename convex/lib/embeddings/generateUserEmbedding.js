/**
 * Build the text prompt for generating a user embedding.
 * Combines interests, skills, and event history context.
 */
export function buildUserEmbeddingText(user, likedEvents = [], registeredEvents = [], attendedEvents = []) {
  const parts = [];

  if (user.interests?.length) {
    parts.push(`Interests: ${user.interests.join(", ")}`);
  }

  if (user.skills?.length) {
    parts.push(`Skills: ${user.skills.join(", ")}`);
  }

  if (user.department) {
    parts.push(`Department: ${user.department}`);
  }

  if (likedEvents.length) {
    const titles = likedEvents.map((e) => e.title).join(", ");
    parts.push(`Liked events: ${titles}`);
  }

  if (registeredEvents.length) {
    const titles = registeredEvents.map((e) => e.title).join(", ");
    parts.push(`Registered for: ${titles}`);
  }

  if (attendedEvents.length) {
    const titles = attendedEvents.map((e) => e.title).join(", ");
    parts.push(`Attended: ${titles}`);
  }

  return parts.join(". ") || "General student interested in campus events";
}
