"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { rescanFlashyIfEmpty } from "@/components/layout/FlashyTracker";

type FlashyWindow = Window & {
  flashy?: (...args: unknown[]) => void;
  __flashyPending?: unknown[][];
  FlashyAddToCart?: (productIds: unknown, popupId?: unknown, callback?: (() => void) | null) => Promise<void>;
};

function sendToFlashy(...args: unknown[]) {
  const w = window as FlashyWindow;
  if (w.flashy) w.flashy(...args);
  else (w.__flashyPending ??= []).push(args);
}

// "מוצרים מתאימים לסל הקניות שלך" — the recommendation slider is configured in the Flashy dashboard
// and rendered by thunder.js into the `.flashy-cart-page` container (same hook the legacy WordPress
// cart page uses). Two things the legacy theme did for it that we replicate:
//   - reports the cart to Flashy ("UpdateCart") so the recommendations match its contents;
//   - provides `window.FlashyAddToCart(ids, popupId, cb)`, called by the slider's "הוספה לסל" button.
export function FlashyCartWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.cart.items);
  const total = useCartStore((s) => s.cart.total);
  const addItem = useCartStore((s) => s.addItem);
  const closeDrawer = useCartStore((s) => s.closeDrawer);

  // thunder.js mutates this container outside React — mount it only after hydration (see FlashyReviewsWidget).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const w = window as FlashyWindow;
    w.FlashyAddToCart = async (productIds, _popupId, callback) => {
      const ids = String(Array.isArray(productIds) ? productIds.join(",") : (productIds ?? ""))
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
      for (const id of ids) await addItem(id, 1);
      closeDrawer(); // we're already on the cart page — the side cart would only cover it
      callback?.();
    };
    return () => {
      delete w.FlashyAddToCart;
    };
  }, [addItem, closeDrawer]);

  const cartSignature = items.map((i) => `${i.product.databaseId}:${i.quantity}`).join("|");
  useEffect(() => {
    if (!cartSignature) return;
    sendToFlashy("UpdateCart", {
      value: Number(total) || 0,
      currency: "ILS",
      content_ids: items.map((i) => String(i.product.databaseId)),
      contents: items.map((i) => ({ id: String(i.product.databaseId), quantity: i.quantity })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartSignature already captures items
  }, [cartSignature, total]);

  useEffect(() => rescanFlashyIfEmpty(ref.current), [mounted]);

  if (!mounted) return null;
  return <div ref={ref} className="flashy-cart-page" />;
}
