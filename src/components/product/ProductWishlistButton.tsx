"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export function ProductWishlistButton({ productId }: { productId: number }) {
  const inWishlist = useWishlistStore((s) => s.has(productId));
  // Wishlist ids are synced once by the Header (root layout).
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-label={inWishlist ? "הסרה מרשימת המשאלות" : "הוספה לרשימת המשאלות"}
      aria-pressed={inWishlist}
      className="group relative flex h-[40px] w-[40px] shrink-0 items-center justify-center"
    >
      <Heart className={`h-6 w-6 transition-transform group-hover:scale-110 ${inWishlist ? "fill-brand-accent text-brand-accent" : "text-black/60"}`} />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-[6px] -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-black px-[10px] py-[6px] text-[14px] font-normal leading-none text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[5px] after:border-t-[5px] after:border-x-transparent after:border-t-black after:content-['']"
      >
        {inWishlist ? "הסרה מהמועדפים" : "הוספה למועדפים"}
      </span>
    </button>
  );
}
