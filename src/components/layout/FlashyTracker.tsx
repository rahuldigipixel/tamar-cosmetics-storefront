"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type FlashyWindow = Window & {
  flashy?: (...args: unknown[]) => void;
  __flashyPending?: unknown[][];
};

// Flashy's popups are configured in the Flashy dashboard and rendered by
// thunder.js (loaded in the root layout). thunder.js only sees a page view on
// the first load of a single-page app, so we report every client-side route
// change ourselves, like the WordPress plugin does on each page load. Calls
// made before thunder.js has lazy-loaded are buffered and flushed by the init
// script in layout.tsx.
export function FlashyTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as FlashyWindow;
    const args: unknown[] = ["PageView"];
    if (w.flashy) w.flashy(...args);
    else (w.__flashyPending ??= []).push(args);
  }, [pathname]);

  return null;
}
