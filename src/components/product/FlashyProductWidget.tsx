"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { rescanFlashyIfEmpty } from "@/components/layout/FlashyTracker";

// Containers thunder.js (loaded once in the root layout) fills with Flashy's
// product-page recommendation sliders — "complementary" (frequently bought
// together) and "similar". Heading and products come from the Flashy dashboard
// settings. Client-only mount: the script mutates the div outside React. No
// reserved height, so the page shows no gap when Flashy has nothing to render
// for the product. Flashy only fills containers present when it initialises, so
// an empty one is re-scanned shortly after mount (see rescanFlashyIfEmpty).
export function FlashyProductWidget({ kind, productId }: { kind: "complementary" | "similar"; productId: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => rescanFlashyIfEmpty(ref.current), [mounted]);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-[1600px] px-[15px]">
      <div ref={ref} className={`flashy-product-page-${kind}`} data-item-id={productId} />
    </div>
  );
}
