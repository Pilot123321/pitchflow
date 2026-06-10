import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// True once GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET exist in .env.local.
// Until then the app runs normally and /profile shows setup steps.
export const authConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: authConfigured
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
});
