"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
function rewriteLegacyLinks(container: HTMLElement, legacyOrigin: string) {
  const links = container.querySelectorAll<HTMLAnchorElement>("a[href]");
  links.forEach((link) => {
    if (link.href.startsWith(legacyOrigin)) link.href = link.href.replace(legacyOrigin, window.location.origin);
  });
}

// Renders into the container thunder.js (loaded once in the root layout) scans
// for and fills with review content fetched from Flashy's cloud. Omit itemId to
// show the site-wide reviews feed instead of a single product's reviews.
//
// The review data was synced from the legacy WP site, so the "view product"
// links thunder.js renders point at that domain (the "Flashy — legacy site URL" setting),
// even for products that also exist on this site. Two independent fixes, since
// thunder.js injects content asynchronously with no render-complete hook:
//   - a MutationObserver rewrites each link's href to this site's origin as it
//     appears, so hover-preview / right-click "open in new tab" / middle-click
//     all point at the right place.
//   - a delegated click handler on the container does an in-app Next.js
//     navigation instead of a full page reload, reading the path straight off
//     the clicked link's href (works even if the observer hasn't run yet,
//     since the path is the same regardless of which origin is on it).
// `elementId` / `legacyOrigin` come from wp-admin → הגדרות תמר → הגדרות כלליות (see resolveIntegrations).
export function FlashyReviewsWidget({
  itemId,
  elementId,
  legacyOrigin,
}: {
  itemId?: number;
  elementId: string;
  legacyOrigin: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // This container's content is injected by thunder.js directly into the
  // DOM, outside React's control. Server-rendering the container (as an
  // empty div) gives React's hydration pass something to compare against
  // that the third-party script can then mutate before or during that
  // comparison, throwing a full-tree hydration mismatch. `useSyncExternalStore`
  // returns the server snapshot (false) through hydration and only switches
  // to the client snapshot (true) afterward, so the container is skipped
  // server-side and on the first client render, then mounted fresh as an
  // ordinary post-hydration update — nothing to hydrate, nothing to mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    rewriteLegacyLinks(el, legacyOrigin);
    const observer = new MutationObserver(() => rewriteLegacyLinks(el, legacyOrigin));
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mounted, legacyOrigin]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest("a");
    if (!link?.href) return;
    // Let modifier-clicks / middle-clicks fall through to normal browser behavior.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const url = new URL(link.href, window.location.href);
    if (!url.pathname.includes("/product/")) return;

    e.preventDefault();
    router.push(url.pathname);
  }

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      onClick={handleClick}
      data-inject-flashy-element={elementId}
      data-item-id={itemId}
    />
  );
}
