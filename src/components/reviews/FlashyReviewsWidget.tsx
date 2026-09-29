"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FLASHY_REVIEWS_ELEMENT_ID, FLASHY_LEGACY_SITE_ORIGIN } from "@/lib/flashy";

function rewriteLegacyLinks(container: HTMLElement) {
  const links = container.querySelectorAll<HTMLAnchorElement>(`a[href^="${FLASHY_LEGACY_SITE_ORIGIN}"]`);
  links.forEach((link) => {
    link.href = link.href.replace(FLASHY_LEGACY_SITE_ORIGIN, window.location.origin);
  });
}

// Renders into the container thunder.js (loaded once in the root layout) scans
// for and fills with review content fetched from Flashy's cloud. Omit itemId to
// show the site-wide reviews feed instead of a single product's reviews.
//
// The review data was synced from the legacy WP site, so the "view product"
// links thunder.js renders point at that domain (see FLASHY_LEGACY_SITE_ORIGIN),
// even for products that also exist on this site. Two independent fixes, since
// thunder.js injects content asynchronously with no render-complete hook:
//   - a MutationObserver rewrites each link's href to this site's origin as it
//     appears, so hover-preview / right-click "open in new tab" / middle-click
//     all point at the right place.
//   - a delegated click handler on the container does an in-app Next.js
//     navigation instead of a full page reload, reading the path straight off
//     the clicked link's href (works even if the observer hasn't run yet,
//     since the path is the same regardless of which origin is on it).
export function FlashyReviewsWidget({ itemId }: { itemId?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    rewriteLegacyLinks(el);
    const observer = new MutationObserver(() => rewriteLegacyLinks(el));
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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

  return (
    <div
      ref={ref}
      onClick={handleClick}
      data-inject-flashy-element={FLASHY_REVIEWS_ELEMENT_ID}
      data-item-id={itemId}
    />
  );
}
