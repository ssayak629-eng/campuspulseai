"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

// Silence false positive React 19 script warnings and Clerk token 404 logs in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    const errorMsg = typeof args[0] === "string" ? args[0] : "";
    if (
      errorMsg.includes("Encountered a script tag while rendering React component") ||
      errorMsg.includes("tokens/convex") ||
      errorMsg.includes("fapiClient")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://cool-starling-770.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_d2l0dHktcXVhaWwtMS5jbGVyay5hY2NvdW50cy5kZXYk";

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        variables: {
          colorPrimary: "#6366F1",
          colorBackground: "#0A0F1E",
          colorText: "#F9FAFB",
          colorInputBackground: "#111827",
          colorInputText: "#F9FAFB",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-indigo-600 hover:bg-indigo-700 text-white font-medium",
          card: "bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-2xl",
          headerTitle: "text-white font-bold",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton:
            "border border-white/10 bg-white/5 text-white hover:bg-white/10",
          formFieldLabel: "text-gray-300",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-indigo-400",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
