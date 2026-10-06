"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

const SIZES = {
  xs: { width: "w-fit", padding: "px-2.5 py-1.5", text: "text-sm", icon: "h-3 w-3", gap: "gap-1", showIcon: false, iconOnly: false },
  sm: { width: "w-fit", padding: "p-2.5", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: true },
  // Compact icon-only variant (linked-products slider on the product page).
  // Linked-products slider stripe: same 36px height as the quantity box and the price block, so they read as one row.
  stripe: { width: "w-9", padding: "h-9", text: "text-sm", icon: "h-4 w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  // Product-card slider row: 40px, same height as the quantity box and the price block.
  row: { width: "w-9 md:w-10", padding: "h-9 md:h-10", text: "text-sm", icon: "h-4 w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  // Same row on one-card-per-slide mobile cards (SALE / related): bigger touch target, desktop identical to "row".
  rowWide: { width: "w-11 md:w-10", padding: "h-11 md:h-10", text: "text-sm", icon: "h-5 w-5 md:h-4 md:w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  mini: { width: "w-fit", padding: "p-2", text: "text-sm", icon: "h-3.5 w-3.5", gap: "gap-1", showIcon: true, iconOnly: true },
  // Linked-products slider: full-width text button under the quantity box.
  slider: { width: "w-full", padding: "px-2 h-8 whitespace-nowrap", text: "text-[14px] leading-none", icon: "h-4 w-4", gap: "gap-1.5", showIcon: false, iconOnly: false },
  md: { width: "w-full", padding: "px-6 py-3", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: false },
  // Single product page: legacy-site sizing (arbitrary px on purpose — approved exception to the 18px floor).
  lg: { width: "w-full", padding: "px-2 sm:px-4 h-[40px] whitespace-nowrap", text: "text-[18px] leading-[22px] font-light sm:font-semibold", icon: "h-4 w-4", gap: "gap-2", showIcon: false, iconOnly: false },
} as const;

const PRIMARY_STYLE =
  "bg-gradient-to-l from-brand-accent to-[#ff6b72] text-white shadow-sm hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]";
// Light-pink secondary CTA (reference "הוספה לסל" next to the red "קנה עכשיו").
const SOFT_STYLE =
  "bg-[#f3c3cc] text-[#333] hover:bg-[#eeb0bb] hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.35)]";

// Tooltip rendered in a portal with fixed positioning so carousel overflow can't clip it;
// clamped to the viewport so it never runs off either edge.
function IconTip({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    // Keep the tooltip inside its product card (falls back to the viewport).
    const box = ref.current?.closest("[data-tip-bounds]")?.getBoundingClientRect();
    const half = 45;
    const min = Math.max(box?.left ?? 0, 0) + half + 4;
    const max = Math.min(box?.right ?? window.innerWidth, window.innerWidth) - half - 4;
    const x = Math.min(Math.max(r.left + r.width / 2, min), Math.max(min, max));
    setPos({ x, y: r.top - 6 });
  }

  return (
    <div
      ref={ref}
      className="relative inline-flex shrink-0"
      onMouseEnter={show}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos
        ? createPortal(
            <span
              role="tooltip"
              style={{ left: pos.x, top: pos.y }}
              className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/85 px-2 py-0.5 text-[14px] leading-[18px] text-white shadow-md"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </div>
  );
}

export function AddToCartButton({
  productId,
  inStock,
  variationId,
  quantity = 1,
  size = "md",
  variant = "primary",
}: {
  productId: number;
  inStock: boolean;
  variationId?: number;
  quantity?: number;
  size?: keyof typeof SIZES;
  variant?: "primary" | "soft";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [submitting, setSubmitting] = useState(false);
  const s = SIZES[size];

  if (!inStock) {
    if (s.iconOnly) {
      return (
        <IconTip label="אזל מהמלאי">
          <button
            disabled
            aria-label="אזל מהמלאי"
            className={`flex ${s.width} shrink-0 items-center justify-center rounded-full bg-black/10 ${s.padding} text-black/40`}
          >
            <ShoppingBag className={s.icon} />
          </button>
        </IconTip>
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
      className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full ${variant === "soft" ? SOFT_STYLE : PRIMARY_STYLE} ${s.padding} ${s.text} ${size === "lg" ? "" : "font-semibold"} transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0`}
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
    <IconTip label="הוספה לסל">{button}</IconTip>
  );
}
