"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export function WishlistButton({ productId }: { productId: number }) {
  const has = useWishlistStore((s) => s.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
