export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://alive-reindeer-60.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
