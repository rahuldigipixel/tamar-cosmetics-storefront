"use client";

import { Minus, Plus } from "lucide-react";

const SIZES = {
  xs: { height: "h-8", buttonWidth: "w-5", numberWidth: "w-4", icon: "h-2.5 w-2.5", text: "text-sm" },
  // Linked-products slider on the product page: legacy-site sizing (arbitrary px on purpose — approved exception to the 18px floor).
  mini: { height: "h-7", buttonWidth: "w-5", numberWidth: "w-5", icon: "h-2.5 w-2.5", text: "text-[14px] leading-none" },
  // Product-card slider row: 40px, level with the cart icon and the price block.
  row: { height: "h-9 md:h-10", buttonWidth: "w-5 md:w-6 lg:max-[1279px]:w-6", numberWidth: "w-5 lg:max-[1279px]:w-6", icon: "h-2.5 w-2.5", text: "text-[14px] leading-none" },
  // Same row on one-card-per-slide mobile cards (SALE / related): bigger touch target, desktop identical to "row".
  rowWide: { height: "h-11 md:h-10", buttonWidth: "w-7 md:w-6", numberWidth: "w-6 md:w-5", icon: "h-3.5 w-3.5 md:h-2.5 md:w-2.5", text: "text-[18px] md:text-[14px] leading-none" },
  sm: { height: "h-10", buttonWidth: "w-8", numberWidth: "w-6", icon: "h-3.5 w-3.5", text: "text-sm" },
  md: { height: "h-14", buttonWidth: "w-12", numberWidth: "w-8", icon: "h-4 w-4", text: "text-lg" },
} as const;

export function QuantityStepper({
  quantity,
  onChange,
  size = "sm",
}: {
  quantity: number;
  onChange: (next: number) => void;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  return (
    <div className={`flex ${s.height} ${"width" in s ? s.width : "w-fit"} shrink-0 items-center self-center rounded-full border border-black/10`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="הפחת כמות"
        className={`flex h-full ${s.buttonWidth} items-center justify-center text-black/60 transition-colors hover:text-brand-accent`}
      >
        <Minus className={s.icon} />
      </button>
      <span className={`${s.numberWidth} text-center ${s.text} font-semibold tabular-nums`}>{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        aria-label="הוסף כמות"
        className={`flex h-full ${s.buttonWidth} items-center justify-center text-black/60 transition-colors hover:text-brand-accent`}
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}
