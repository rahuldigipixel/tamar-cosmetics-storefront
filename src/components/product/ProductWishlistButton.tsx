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
      className="flex h-[40px] w-[40px] shrink-0 items-center justify-center transition-transform hover:scale-110"
    >
      <Heart className={`h-6 w-6 ${inWishlist ? "fill-brand-accent text-brand-accent" : "text-black/60"}`} />
    </button>
  );
}
