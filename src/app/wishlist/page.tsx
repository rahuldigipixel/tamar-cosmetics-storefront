"use client";

import { useEffect, useState } from "react";
import { ProductGridCard } from "@/components/product/ProductGridCard";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const [products, setProducts] = useState<Product[]>([]);
  // Tracks which ids the currently-shown `products` were fetched for, so
  // "loading" can be derived instead of toggled — comparing this against the
  // live ids is what keeps the page from ever rendering an empty-list flash
  // for ids that just haven't resolved yet.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  // Gated on the persisted store rehydrating from localStorage first —
  // otherwise productIds briefly reads as [] on mount and this page treats
  // that as "nothing saved" before the real, persisted ids ever load.
  const [storeReady, setStoreReady] = useState(() => useWishlistStore.persist.hasHydrated());

  useEffect(() => {
    if (storeReady) return;
    return useWishlistStore.persist.onFinishHydration(() => setStoreReady(true));
  }, [storeReady]);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idsKey = productIds.join(",");

  useEffect(() => {
    if (!storeReady) return;
    let cancelled = false;
    Promise.all(
      productIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((fetched) => {
      if (cancelled) return;
      setProducts(fetched.filter((p): p is Product => Boolean(p)));
      setLoadedKey(idsKey);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, storeReady]);

  const loading = !storeReady || loadedKey !== idsKey;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">רשימת המשאלות</h1>

      {loading ? (
        <p className="text-black/60">טוען...</p>
      ) : products.length === 0 ? (
        <p className="text-black/60">רשימת המשאלות שלך ריקה.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
