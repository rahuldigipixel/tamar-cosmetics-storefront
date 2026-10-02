"use client";

import { Heart } from "lucide-react";
import type { Product } from "@/types/product";
import { useQuickViewStore } from "@/lib/store/useQuickViewStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

// Reference's quick-view glyph: an open eye with lashes on top that swaps to a
// closed (lashes-down) eye while its button is hovered.
function QuickViewIcon() {
  const svg = "h-[22px] w-[22px] fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]";
  return (
    <>
      <svg viewBox="0 0 24 24" className={`${svg} group-hover/action:hidden`} aria-hidden>
        <path d="M3 13c2-4.5 5-6.5 9-6.5s7 2 9 6.5" />
        <path d="M9.5 13a2.5 2.5 0 0 0 5 0" />
        <path d="M12 3.5V5M6.5 5.5l1 1.3M17.5 5.5l-1 1.3" />
      </svg>
      <svg viewBox="0 0 24 24" className={`${svg} hidden group-hover/action:block`} aria-hidden>
        <path d="M3 9c2 4.5 5 6.5 9 6.5s7-2 9-6.5" />
        <path d="M12 20.5V19M6.5 18.5l1-1.3M17.5 18.5l-1-1.3" />
      </svg>
    </>
  );
}

function ActionButton({
  label,
  onClick,
  pressed,
  hideOnMobile,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  hideOnMobile?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`group/action relative ${hideOnMobile ? "max-md:hidden" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        className="flex h-[45px] w-[50px] items-center justify-center bg-white text-[#333] transition-colors hover:text-[#777] max-md:h-[32px] max-md:w-[32px] max-md:rounded-full max-md:shadow-[0_0_4px_rgba(0,0,0,.15)]"
      >
        {children}
      </button>
      {/* Black tooltip beside the icon, shown on that icon's hover. */}
      <span className="pointer-events-none absolute top-1/2 left-full z-20 ml-[10px] -translate-y-1/2 whitespace-nowrap bg-black px-[10px] py-[5px] text-[13px] leading-[1.3] text-white opacity-0 transition-opacity duration-150 before:absolute before:top-1/2 before:right-full before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-black before:content-[''] group-hover/action:opacity-100 group-focus-within/action:opacity-100">
        {label}
      </span>
    </div>
  );
}

/**
 * Quick-view (eye) + wishlist (heart) buttons that appear on a product
 * card's hover (card root must carry the `group` class). White stacked
 * squares with a soft shadow; each shows a black tooltip on hover. On touch
 * screens (no hover) they stay visible. `className` positions the stack.
 */
export function ProductHoverActions({ product, className = "" }: { product: Product; className?: string }) {
  const openQuickView = useQuickViewStore((s) => s.open);
  const inWishlist = useWishlistStore((s) => s.has(product.databaseId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  return (
    <div
      className={`absolute z-10 flex flex-col bg-white opacity-0 max-md:bg-transparent max-md:opacity-100 max-md:shadow-none shadow-[0_0_5px_rgba(0,0,0,.15)] transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
    >
      <ActionButton label="מבט מהיר" hideOnMobile onClick={() => openQuickView(product)}>
        <QuickViewIcon />
      </ActionButton>
      <ActionButton
        label={inWishlist ? "הסרה מהמועדפים" : "הוספה למועדפים"}
        pressed={inWishlist}
        onClick={() => toggleWishlist(product.databaseId)}
      >
        <Heart className={`h-[20px] w-[20px] max-md:h-[16px] max-md:w-[16px] stroke-[1.5] ${inWishlist ? "fill-[#d52027] text-[#d52027]" : ""}`} />
      </ActionButton>
    </div>
  );
}
