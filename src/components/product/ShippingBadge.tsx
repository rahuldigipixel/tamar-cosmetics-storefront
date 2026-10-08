"use client";

import { createContext, useContext } from "react";

import { DEFAULT_SHIPPING_BADGE, type ShippingBadgeConfig } from "@/lib/utils/shippingBadge";

const ShippingBadgeContext = createContext<ShippingBadgeConfig>(DEFAULT_SHIPPING_BADGE);

export function ShippingBadgeProvider({ config, children }: { config: ShippingBadgeConfig; children: React.ReactNode }) {
  return <ShippingBadgeContext.Provider value={config}>{children}</ShippingBadgeContext.Provider>;
}

/** First number in a price string — for a variable product's range ("10 - 20") that is the lowest price, like WC's get_price(). */
function parsePrice(price: string | number | undefined): number {
  if (typeof price === "number") return price;
  const match = String(price ?? "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

/**
 * Red square over the product image for products at/above the wp-admin price limit. Copied from the legacy
 * `.products-shipping-message` / `.sinlge-product-shipping-message .msg` (50×50, #f30, 13px/600, white) — the 13px is
 * the legacy size, an approved exception to the 18px floor (see AGENTS.md). Position it with `className`.
 */
export function ShippingBadge({ price, className = "" }: { price: string | number | undefined; className?: string }) {
  const { enabled, threshold, message } = useContext(ShippingBadgeContext);
  if (!enabled || parsePrice(price) < threshold) return null;
  return (
    <div
      className={`pointer-events-none absolute z-[1] flex h-[50px] w-[50px] items-center justify-center bg-[#f30] px-[6px] py-[3px] text-center text-[13px] leading-[1.2em] font-semibold text-white ${className}`}
    >
      {message}
    </div>
  );
}
