"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type FlashyWindow = Window & {
  flashy?: (...args: unknown[]) => void;
  __flashyPending?: unknown[][];
};

/**
 * Flashy fills `[data-inject-flashy-element]` containers exactly once, with a
 * single `document.querySelector` right after it initialises. A container that
 * mounts later (slow hydration, or a client-side route change) is never filled
 * and re-calling `flashy("init")` doesn't help. Loading thunder.js again does
 * (verified: no duplicated popups), so widgets call this when their container
 * is still empty a few seconds after mounting. Returns a cleanup function.
 */
export function rescanFlashyIfEmpty(el: HTMLElement | null, delayMs = 3000): () => void {
  if (!el) return () => {};
  const timer = window.setTimeout(() => {
    const w = window as FlashyWindow & { __flashyAccountId?: number };
    // Filled, or Flashy hasn't even been loaded yet (its own init will find the container).
    if (el.childElementCount > 0 || !w.flashy || !w.__flashyAccountId) return;
    delete w.flashy;
    // Cached popup list → containers aren't filled (see the flashy-init script in layout.tsx); force a fresh fetch.
    try {
      localStorage.removeItem("flashy_popups_cache_time");
    } catch {}
    const script = document.createElement("script");
    script.src = "https://js.flashyapp.com/thunder.js";
    script.async = true;
    document.head.appendChild(script);
    // Same stub as the loader snippet in layout.tsx (thunder.js drains `queue`, which holds `arguments` objects).
    const stub = function () {
      // eslint-disable-next-line prefer-rest-params
      stub.queue.push(arguments);
    } as unknown as ((...args: unknown[]) => void) & { queue: unknown[] };
    stub.queue = [];
    w.flashy = stub;
    w.flashy("init", w.__flashyAccountId);
  }, delayMs);
  return () => window.clearTimeout(timer);
}

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
