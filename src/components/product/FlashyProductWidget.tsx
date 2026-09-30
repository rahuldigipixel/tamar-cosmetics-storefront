"use client";

import { useSyncExternalStore } from "react";

// Containers thunder.js (loaded once in the root layout) fills with Flashy's
// product-page recommendation sliders — "complementary" (frequently bought
// together) and "similar". Heading and products come from the Flashy dashboard
// settings. Client-only mount, same reason as FlashyStarRating: the script
// mutates the div outside React. No reserved height, so the page shows no gap
// when Flashy has nothing to render for the product.
export function FlashyProductWidget({ kind, productId }: { kind: "complementary" | "similar"; productId: number }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-[1600px] px-[15px]">
      <div className={`flashy-product-page-${kind}`} data-item-id={productId} />
    </div>
  );
}
