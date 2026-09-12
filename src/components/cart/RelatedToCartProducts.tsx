"use client";

import { useEffect, useState } from "react";
import { ProductGridCard } from "@/components/product/ProductGridCard";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

export function RelatedToCartProducts({ items }: { items: CartItem[] }) {
  const [products, setProducts] = useState<Product[]>([]);

  const categorySlug = items.flatMap((i) => i.product.categories).find(Boolean)?.slug;
  const excludeIds = items.map((i) => i.product.databaseId).join(",");

  useEffect(() => {
    if (!categorySlug) {
      setProducts([]);
      return;
    }
    const params = new URLSearchParams({ category: categorySlug, first: "8" });
    excludeIds.split(",").forEach((id) => id && params.append("exclude", id));

    let cancelled = false;
    fetch(`/api/products/related?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts((data.products ?? []).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug, excludeIds]);

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">מוצרים שמתאימים לעגלת הקניות שלך</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
