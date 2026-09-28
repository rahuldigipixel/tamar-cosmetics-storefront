"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

const SIZES = {
  xs: { width: "w-fit", padding: "px-2.5 py-1.5", text: "text-sm", icon: "h-3 w-3", gap: "gap-1", showIcon: false, iconOnly: false },
  sm: { width: "w-fit", padding: "p-2.5", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: true },
  md: { width: "w-full", padding: "px-6 py-3", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: false },
} as const;

export function AddToCartButton({
  productId,
  inStock,
  variationId,
  quantity = 1,
  size = "md",
}: {
  productId: number;
  inStock: boolean;
  variationId?: number;
  quantity?: number;
  size?: keyof typeof SIZES;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [submitting, setSubmitting] = useState(false);
  const s = SIZES[size];

  if (!inStock) {
    if (s.iconOnly) {
      return (
        <div className="group/cart relative inline-flex shrink-0">
          <button
            disabled
            aria-label="אזל מהמלאי"
            className={`flex ${s.width} shrink-0 items-center justify-center rounded-full bg-black/10 ${s.padding} text-black/40`}
          >
            <ShoppingBag className={s.icon} />
          </button>
          <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-150 group-hover/cart:opacity-100">
            אזל מהמלאי
          </span>
        </div>
      );
    }
    return (
      <button
        disabled
        className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full bg-black/10 ${s.padding} ${s.text} font-semibold text-black/40`}
      >
        אזל מהמלאי
      </button>
    );
  }

  async function handleClick() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addItem(productId, quantity, variationId);
    } finally {
      setSubmitting(false);
    }
  }

  const button = (
    <button
      onClick={handleClick}
      disabled={submitting}
      aria-label={s.iconOnly ? "הוספה לסל" : undefined}
      className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] ${s.padding} ${s.text} font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:opacity-70 disabled:hover:translate-y-0`}
    >
      {submitting ? (
        <Loader2 className={`${s.icon} animate-spin`} />
      ) : s.iconOnly ? (
        <ShoppingBag className={s.icon} />
      ) : (
        <>
          {s.showIcon ? <ShoppingBag className={s.icon} /> : null}
          הוספה לסל
        </>
      )}
    </button>
  );

  if (!s.iconOnly) return button;

  return (
    <div className="group/cart relative inline-flex shrink-0">
      {button}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-150 group-hover/cart:opacity-100">
        הוספה לסל
      </span>
    </div>
  );
}
