"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

/**
 * Hook that returns the current Convex user, synced from Clerk.
 * Automatically creates the user in Convex if it doesn't exist.
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkLoaded && isSignedIn && clerkUser
      ? { clerkId: clerkUser.id }
      : "skip"
  );

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (!clerkLoaded || !isSignedIn || !clerkUser) return;
    if (convexUser !== null && convexUser !== undefined) return;
    if (convexUser === undefined) return; // still loading

    // User doesn't exist in Convex yet — create them
    createUser({
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: clerkUser.fullName ?? clerkUser.username ?? "Anonymous",
      imageUrl: clerkUser.imageUrl,
    });
  }, [clerkLoaded, isSignedIn, clerkUser, convexUser, createUser]);

  return {
    user: convexUser,
    clerkUser,
    isLoaded: clerkLoaded && convexUser !== undefined,
    isSignedIn,
  };
}
