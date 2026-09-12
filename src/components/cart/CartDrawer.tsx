"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      <aside
        className={`fixed inset-y-0 end-0 z-[95] flex w-[90%] max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="עגלת קניות"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-lg font-bold">עגלת הקניות שלי</h2>
          <button
            onClick={closeDrawer}
            aria-label="סגירה"
            className="rounded-full p-2 text-black/60 hover:bg-black/5 hover:text-brand-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-black/20" />
            <p className="text-lg font-medium text-black/60">העגלה שלך ריקה</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="mt-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-2.5 text-base font-semibold text-white"
            >
              המשך בקניות
            </Link>
          </div>
        ) : (
          <>
            <ul className="thin-scrollbar flex-1 divide-y divide-black/5 overflow-y-auto px-5">
              {cart.items.map((item) => (
                <li key={item.key} className="flex gap-3 py-3">
                  {item.product.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-soft/30">
                      <Image
                        src={item.product.image.src}
                        alt={item.product.image.alt || item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1 text-right">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{item.product.name}</p>
                    {item.variation ? <p className="mt-0.5 text-xs text-black/50">{item.variation.name}</p> : null}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex h-8 items-center rounded-full border border-black/10">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="הפחת כמות"
                          className="flex h-full w-8 items-center justify-center text-black/60 disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                          aria-label="הוסף כמות"
                          className="flex h-full w-8 items-center justify-center text-black/60 disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-brand-accent">{formatPrice(item.total)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label="הסרה"
                    className="h-fit shrink-0 rounded-full p-1.5 text-black/30 hover:bg-black/5 hover:text-brand-accent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-black/5 px-5 py-4">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>סה&quot;כ</span>
                <span className="text-brand-accent">{formatPrice(cart.total)}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex-1 rounded-full border-2 border-black py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                >
                  לצפייה בעגלה
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex-1 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-3 text-center text-sm font-semibold text-white"
                >
                  מעבר לתשלום
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
