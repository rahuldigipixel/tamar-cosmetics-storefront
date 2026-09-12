"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";

function formatPrice(value: string, currency = "ILS") {
  const numeric = Number(value);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency }).format(
    Number.isNaN(numeric) ? 0 : numeric
  );
}

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">עגלת קניות</h1>

      {cart.items.length === 0 ? (
        <div className="text-center text-black/60">
          <p>העגלה שלך ריקה.</p>
          <Link href="/shop" className="mt-4 inline-block text-brand-accent hover:underline">
            המשך בקניות
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-black/5">
            {cart.items.map((item) => (
              <li key={item.key} className="flex items-center gap-4 py-4">
                {item.product.image ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-brand-soft/30">
                    <Image
                      src={item.product.image.src}
                      alt={item.product.image.alt || item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex-1 text-right">
                  <p className="font-medium">{item.product.name}</p>
                  {item.variation ? <p className="text-xs text-black/50">{item.variation.name}</p> : null}
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                      className="h-6 w-6 rounded border border-black/10 text-sm disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                      disabled={loading}
                      className="h-6 w-6 rounded border border-black/10 text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="font-semibold">{formatPrice(item.total)}</span>
                <button
                  onClick={() => removeItem(item.key)}
                  disabled={loading}
                  className="text-sm text-black/40 hover:text-brand-accent"
                >
                  הסרה
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-lg font-semibold">סה&quot;כ: {formatPrice(cart.total)}</span>
            <Link
              href="/checkout"
              className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-accent"
            >
              מעבר לתשלום
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
