"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Heart, X } from "lucide-react";
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
      {(loading || visible.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[18px] font-bold leading-[25px] text-[#0c0c0c]">עמוד המועדפים שלך</h1>
          <WishlistShare />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center font-[Arial,Helvetica,sans-serif] text-[#0c0c0c]">
          {/* Legacy empty state (Arial): 182px/106px faint heart, 48px/28px bold title, 23px/21px text, 14px button. */}
          <Heart className="mx-auto mb-5 h-[106px] w-[106px] text-black/[0.07] lg:h-[182px] lg:w-[182px]" strokeWidth={1.6} aria-hidden />
          <p className="mb-[15px] text-[28px] font-bold leading-[33.6px] lg:text-[48px] lg:leading-[58px]">רשימת המועדפים ריקה.</p>
          <div className="text-[21px] leading-[33.6px] lg:text-[23px] lg:leading-[37px]">
            <p dir="ltr">You don&apos;t have any products in the wishlist yet.</p>
            <p dir="ltr">You will find a lot of interesting products on our &quot;Shop&quot; page.</p>
          </div>
          <p className="mb-[19.5px] mt-[25px] lg:mb-24">
            <Link
              href="/shop"
              prefetch={false}
              className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-7 text-[14px] font-semibold leading-[16.8px] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]"
            >
              חזרה לחנות
            </Link>
          </p>
        </div>
      ) : (
        <>
          {selected.size > 0 && (
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
          )}

          <div className="-mx-[15px] grid grid-cols-2 lg:grid-cols-4">
            {visible.map((product) => (
              <div key={product.id} className="flex flex-col gap-2 p-[15px] pt-[17px] transition-shadow duration-200 hover:shadow-[0_0_9px_rgba(0,0,0,.15)]">
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
                <CategoryProductCard product={product} standalone wishlist />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
