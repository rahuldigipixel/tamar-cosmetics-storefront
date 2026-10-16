"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const START_EVENT = "tamar:navigation-start";
// Quick navigations (cached / prefetched pages) only get the thin top bar; the centred spinner joins after this delay.
const SPINNER_DELAY_MS = 250;
// Safety net: a navigation that never lands (aborted, redirected back to the same page) can't leave the loader up forever.
const GIVE_UP_MS = 12000;

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** Whether `href` is another page of this site (different path or query) — hash jumps, same-page links and other origins are not. */
function leavesCurrentPage(href: string): boolean {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return trimSlash(url.pathname) !== trimSlash(window.location.pathname) || url.search !== window.location.search;
}

/**
 * Starts the navigation loader for a programmatic `router.push()` (link clicks start it by themselves). Pass the target
 * `href` so a push to the page that is already open — which would never "land" — doesn't leave the loader waiting.
 */
export function startNavigation(href?: string) {
  if (typeof window === "undefined") return;
  if (href !== undefined && !leavesCurrentPage(href)) return;
  window.dispatchEvent(new Event(START_EVENT));
}

/**
 * Instant feedback for every page change. Dynamic routes are linked with `prefetch={false}` (see RULES.md), so after a
 * click nothing changes on screen until the server answers — it looked like the click did nothing. This shows a progress
 * bar at the top the moment a link is clicked (plus a centred spinner if it takes longer than a moment) and removes it
 * as soon as the new route is committed — from there the route's own `loading.tsx` skeleton takes over.
 *
 * Link clicks are caught with one capturing document listener, so it covers every `<a>` / `next/link` on the site
 * (menu, product cards, search results, pagination, footer…) without touching each one. Needs a Suspense boundary
 * around it because of `useSearchParams`.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const routeKey = `${trimSlash(pathname)}?${search}`;

  // The route as last rendered — what a click is leaving.
  const routeRef = useRef(routeKey);
  useEffect(() => {
    routeRef.current = routeKey;
  }, [routeKey]);

  const idRef = useRef(0);
  // The navigation in flight: pending only while the route is still the one it started from, so "loading" ends from the
  // real arrival of the new route and not from a flag flipped by hand.
  const [nav, setNav] = useState<{ id: number; from: string } | null>(null);
  // Id of the navigation whose spinner delay has passed.
  const [spinnerFor, setSpinnerFor] = useState<number | null>(null);

  // Route changed since the click → it landed. (Set during render, guarded: React re-renders at once without painting the stale loader.)
  if (nav && nav.from !== routeKey) setNav(null);

  useEffect(() => {
    function begin() {
      idRef.current += 1;
      setNav({ id: idRef.current, from: routeRef.current });
    }

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      if (leavesCurrentPage(anchor.href)) begin();
    }

    // Capture phase: runs before any handler that might stop propagation (the Flashy reviews widget does its own router.push).
    document.addEventListener("click", onClick, true);
    window.addEventListener(START_EVENT, begin);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(START_EVENT, begin);
    };
  }, []);

  const navId = nav?.id ?? null;
  useEffect(() => {
    if (navId === null) return;
    const spinner = window.setTimeout(() => setSpinnerFor(navId), SPINNER_DELAY_MS);
    const giveUp = window.setTimeout(() => setNav(null), GIVE_UP_MS);
    return () => {
      window.clearTimeout(spinner);
      window.clearTimeout(giveUp);
    };
  }, [navId]);

  if (!nav) return null;

  return (
    <>
      <div role="progressbar" aria-label="טוען עמוד" className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-[3px]">
        {/* key restarts the animation when a second link is clicked before the first one landed. */}
        <div
          key={nav.id}
          className="animate-nav-progress h-full bg-gradient-to-l from-brand-accent to-[#ff6b72] shadow-[0_0_8px_rgba(213,32,39,0.6)]"
        />
      </div>
      {spinnerFor === nav.id ? (
        // pointer-events-none: the page stays clickable, so a second click simply replaces the first navigation.
        <div role="status" aria-label="טוען" className="pointer-events-none fixed inset-0 z-[250] flex items-center justify-center bg-white/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
            <Loader2 className="h-7 w-7 animate-spin text-brand-accent" />
          </span>
        </div>
      ) : null}
    </>
  );
}
