"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export function WishlistButton({ productId }: { productId: number }) {
  const has = useWishlistStore((s) => s.has(productId));
  // Wishlist ids are synced once by the Header (root layout).
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      onClick={() => toggle(productId)}
      aria-pressed={has}
      className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
        has ? "border-brand-accent text-brand-accent" : "border-black/10 hover:border-brand-accent"
      }`}
    >
      <Heart className={`h-4 w-4 ${has ? "fill-brand-accent" : ""}`} />
      {has ? "ברשימת המשאלות" : "הוספה לרשימת המשאלות"}
    </button>
  );
}
