import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const syncGoogleAuthWithBackend = useCallback(async () => {
    if (session?.user) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies
          body: JSON.stringify({
            googleId: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync with backend");
        }

        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error("Error syncing with backend:", error);
        throw error;
      }
    }
  }, [session]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.ok) {
        // Sync with backend after successful Google sign-in
        await syncGoogleAuthWithBackend();
      }

      return result;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }, [syncGoogleAuthWithBackend]);

  const logout = useCallback(async () => {
    try {
      // First logout from backend
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      // Then logout from NextAuth
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if backend logout fails, still logout from NextAuth
      await signOut({ redirect: false });
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get current user");
      }

      return await response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }, []);

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    loginWithGoogle,
    logout,
    syncGoogleAuthWithBackend,
    getCurrentUser,
  };
};
