"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BackInStockForm } from "@/components/product/BackInStockForm";
import { useCartStore } from "@/lib/store/useCartStore";

function QuantityStepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  return (
    <div className="flex h-[40px] w-[96px] shrink-0 items-center justify-between rounded-full border border-black/20 px-1 text-[18px] font-light text-black sm:w-[96px] min-[1280px]:w-auto sm:text-[16px] sm:font-normal sm:justify-start">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="הפחת כמות"
        className="flex h-full w-9 items-center justify-center transition-colors hover:text-brand-accent"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        aria-label="הוסף כמות"
        className="flex h-full w-9 items-center justify-center transition-colors hover:text-brand-accent"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Adds the selected quantity to the cart, then goes straight to checkout (no drawer). */
function BuyNowButton({ productId, quantity }: { productId: number; quantity: number }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addItem(productId, quantity);
      // addItem opens the mini-cart drawer — not wanted when jumping to checkout.
      closeDrawer();
      router.push("/checkout");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="flex h-[40px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-brand-accent bg-white px-2 sm:px-4 text-[18px] md:text-[16px] min-[1280px]:text-[18px] leading-[22px] font-light text-black transition-all sm:font-semibold duration-200 hover:-translate-y-0.5 hover:bg-brand-accent hover:text-white hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "קנה עכשיו"}
    </button>
  );
}

// RTL row, right → left: buy now, add to cart, quantity (matches the reference).
export function ProductPurchasePanel({ productId, inStock }: { productId: number; inStock: boolean }) {
  const [quantity, setQuantity] = useState(1);

  // Out of stock: no add-to-cart / quantity — the back-in-stock signup replaces them.
  if (!inStock) return <BackInStockForm productId={productId} />;

  return (
    <div className="mt-[25px] flex flex-wrap items-center gap-[8px] sm:gap-[12px]">
      {inStock ? (
        <div className="min-w-[100px] flex-1 sm:max-w-[168px] md:max-w-none min-[1640px]:max-w-[168px]">
          <BuyNowButton productId={productId} quantity={quantity} />
        </div>
      ) : null}
      <div className="min-w-[100px] flex-1 sm:max-w-[168px] md:max-w-none min-[1640px]:max-w-[168px]">
        <AddToCartButton productId={productId} inStock={inStock} quantity={quantity} size="lg" />
      </div>
      <QuantityStepper quantity={quantity} onChange={setQuantity} />
    </div>
  );
}
