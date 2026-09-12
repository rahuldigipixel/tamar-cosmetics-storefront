"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

export function AddToCartButton({
  productId,
  inStock,
  variationId,
  quantity = 1,
}: {
  productId: number;
  inStock: boolean;
  variationId?: number;
  quantity?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [submitting, setSubmitting] = useState(false);

  if (!inStock) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-full bg-black/10 px-6 py-3 text-sm font-semibold text-black/40"
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
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          הוספה לסל
        </>
      )}
    </button>
  );
}
