"use client";

import { useSyncExternalStore } from "react";

// Container thunder.js (loaded once in the root layout) fills with the
// product's star rating. Mounted client-side only, same as
// FlashyReviewsWidget: the script mutates this div outside React, so it must
// not be part of the server-rendered tree React hydrates against.
export function FlashyStarRating({ productId }: { productId: number }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return <div className="mt-[10px] min-h-[24px]" />;

  return (
    <div className="mt-[10px] min-h-[24px]">
      <div className="flashy-star-rating" data-item-id={productId} />
    </div>
  );
}
