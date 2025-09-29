import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Sync with backend when user signs in
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            }/api/auth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                googleId: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error("Failed to sync with backend:", response.status, response.statusText);
            // Allow sign-in even if backend sync fails
            console.warn("Proceeding with sign-in despite backend sync failure");
            return true;
          }

          return true;
        } catch (error) {
          console.error("Backend sync error:", error);
          // Allow sign-in even if backend is unreachable
          console.warn("Backend unreachable, proceeding with sign-in");
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
