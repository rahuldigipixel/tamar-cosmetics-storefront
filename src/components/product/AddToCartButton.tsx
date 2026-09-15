"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

const SIZES = {
  xs: { width: "w-fit", padding: "px-2.5 py-1.5", text: "text-sm", icon: "h-3 w-3", gap: "gap-1", showIcon: false },
  sm: { width: "w-fit", padding: "px-5 py-2.5", text: "text-sm", icon: "h-3.5 w-3.5", gap: "gap-2", showIcon: true },
  md: { width: "w-full", padding: "px-6 py-3", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true },
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

  return (
    <button
      onClick={handleClick}
      disabled={submitting}
      className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] ${s.padding} ${s.text} font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:opacity-70 disabled:hover:translate-y-0`}
    >
      {submitting ? (
        <Loader2 className={`${s.icon} animate-spin`} />
      ) : (
        <>
          {s.showIcon ? <ShoppingBag className={s.icon} /> : null}
          הוספה לסל
        </>
      )}
    </button>
  );
}
