"use client";

import { Minus, Plus } from "lucide-react";

const SIZES = {
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
    <div className={`flex ${s.height} w-fit shrink-0 items-center self-center rounded-full border border-black/10`}>
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
