"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
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
  const loading = useCartStore((s) => s.loading);
  const [added, setAdded] = useState(false);

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

  return (
    <button
      disabled={loading}
      onClick={async () => {
        await addItem(productId, quantity, variationId);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${
        added
          ? "bg-green-600"
          : "bg-gradient-to-l from-brand-accent to-[#ff6b72] hover:from-[#ff6b72] hover:to-brand-accent"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          נוסף לעגלה
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          הוספה לסל
        </>
      )}
    </button>
  );
}
