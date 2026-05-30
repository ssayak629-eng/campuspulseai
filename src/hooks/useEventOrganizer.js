"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Returns the current user's role for a specific event.
 */
export function useEventOrganizer(eventId, userId) {
  const role = useQuery(
    api.organizers.getUserOrganizerRole,
    eventId && userId ? { eventId, userId } : "skip"
  );

  return {
    role: role ?? null,
    isOwner: role === "owner",
    isOrganizer: role === "organizer" || role === "owner",
    isVolunteer: role === "volunteer",
    canEdit: role === "owner" || role === "organizer",
    canDelete: role === "owner",
    canCheckIn: role === "owner" || role === "organizer" || role === "volunteer",
    isLoading: role === undefined,
  };
}
