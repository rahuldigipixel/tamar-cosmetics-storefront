"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

const FALLBACK_MS = 4000;

/**
 * Full-screen cover shown from the moment logout starts until the home page
 * is on screen, so the logged-out version of the page being left (e.g. the
 * my-account registration form) never flashes in between.
 */
export function LogoutOverlay() {
  const loggingOut = useAuthStore((s) => s.loggingOut);
  const pathname = usePathname();

  useEffect(() => {
    if (!loggingOut) return;
    const release = () => useAuthStore.setState({ loggingOut: false });
    // Arrived home → release (a short beat lets the home page paint first).
    // Also released after a fallback so a failed navigation can't trap the user.
    const timer = window.setTimeout(release, pathname === "/" ? 150 : FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [loggingOut, pathname]);

  if (!loggingOut) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white" role="status" aria-label="מתנתק">
      <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
    </div>
  );
}
