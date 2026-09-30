"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, X } from "lucide-react";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { CategoryProductCard } from "@/components/product/CategoryProductCard";
import { WishlistShare } from "@/components/wishlist/WishlistShare";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import type { Product } from "@/types/product";

const subscribeNoop = () => () => {};

/**
 * Logged-in customers see the wishlist inside the my-account layout (sidebar
 * links); guests get the same content on a plain page.
 */
export function WishlistView() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const loggedIn = useAuthStore((s) => !!s.token);

  if (mounted && loggedIn) {
    return (
      <AccountLayout>
        <WishlistContent />
      </AccountLayout>
    );
  }
  return (
    <div className="mx-auto max-w-[1600px] px-[15px] py-16">
      <WishlistContent />
    </div>
  );
}

function WishlistContent() {
  const productIds = useWishlistStore((s) => s.productIds);
  const hydrated = useWishlistStore((s) => s.hydrated);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const toggle = useWishlistStore((s) => s.toggle);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // One batched request for the ids the list had when it finished loading —
  // never one per product. Removing an item afterwards just filters it out
  // locally (below), so it doesn't refetch or flash a loading state.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const ids = useWishlistStore.getState().productIds;
    const request: Promise<Product[]> = ids.length
      ? fetch(`/api/products?ids=${ids.join(",")}`)
          .then((r) => (r.ok ? r.json() : { products: [] }))
          .then((d: { products?: Product[] }) => d.products ?? [])
          .catch(() => [])
      : Promise.resolve([]);
    request.then((fetched) => {
      if (!cancelled) setProducts(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const loading = !hydrated || products === null;
  const visible = (products ?? []).filter((p) => productIds.includes(p.databaseId));
  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.databaseId));

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function removeIds(ids: number[]) {
    setSelected((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
    // Sequential: the backend stores the list as one serialized user-meta
    // value, so parallel removals could overwrite each other.
    for (const id of ids) await toggle(id);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-black">עמוד המועדפים שלך</h1>
        <WishlistShare />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-[18px] text-black/60">רשימת המשאלות שלך ריקה.</p>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-8 border-y border-black/10 bg-[#f5f5f5] px-3 py-2 text-[18px] font-bold leading-[25px] text-[#0c0c0c]">
            <button
              type="button"
              onClick={() => removeIds([...selected])}
              disabled={selected.size === 0}
              className="flex items-center gap-2 transition-colors hover:text-brand-accent disabled:opacity-40 disabled:hover:text-[#0c0c0c]"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
              הסר
            </button>
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.databaseId)))}
              className="flex items-center gap-2 transition-colors hover:text-brand-accent"
            >
              <Check className="h-5 w-5" strokeWidth={1.5} />
              {allSelected ? "ביטול בחירה" : "בחר הכל"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visible.map((product) => (
              <div key={product.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[18px] font-bold leading-[25px] text-[#0c0c0c]">
                  <button
                    type="button"
                    onClick={() => removeIds([product.databaseId])}
                    className="flex items-center gap-2 transition-colors hover:text-brand-accent"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                    הסר
                  </button>
                  <input
                    type="checkbox"
                    checked={selected.has(product.databaseId)}
                    onChange={() => toggleSelected(product.databaseId)}
                    aria-label={`בחירת ${product.name}`}
                    className="h-5 w-5 cursor-pointer accent-brand-accent"
                  />
                </div>
                <CategoryProductCard product={product} standalone />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
