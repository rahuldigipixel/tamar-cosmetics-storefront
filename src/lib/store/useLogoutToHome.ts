"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./useAuthStore";

/**
 * Logs out and lands on the home page. `loggingOut` raises LogoutOverlay
 * first so the page being left (which re-renders as the login/registration
 * screen the instant the token clears) is never visible mid-way.
 */
export function useLogoutToHome() {
  const router = useRouter();
  return useCallback(async () => {
    useAuthStore.setState({ loggingOut: true });
    await useAuthStore.getState().logout();
    router.push("/");
  }, [router]);
}
