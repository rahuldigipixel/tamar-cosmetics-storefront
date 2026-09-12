"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";

function QuantityStepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  return (
    <div className="flex h-14 w-fit shrink-0 items-center rounded-full border border-black/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="הפחת כמות"
        className="flex h-full w-12 items-center justify-center text-black/60 transition-colors hover:text-brand-accent"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-lg font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        aria-label="הוסף כמות"
        className="flex h-full w-12 items-center justify-center text-black/60 transition-colors hover:text-brand-accent"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductPurchasePanel({ productId, inStock }: { productId: number; inStock: boolean }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <QuantityStepper quantity={quantity} onChange={setQuantity} />
      <div className="w-56">
        <AddToCartButton productId={productId} inStock={inStock} quantity={quantity} />
      </div>
    </div>
  );
}
