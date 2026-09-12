"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    Promise.all(
      productIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((fetched) => setProducts(fetched.filter((p): p is Product => Boolean(p))));
  }, [productIds, loading]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">רשימת המשאלות</h1>

      {loading ? (
        <p className="text-black/60">טוען...</p>
      ) : products.length === 0 ? (
        <p className="text-black/60">רשימת המשאלות שלך ריקה.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
