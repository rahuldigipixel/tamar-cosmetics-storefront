"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";

import { renderShippingMessage, useFreeShipping } from "@/components/cart/FreeShippingProvider";

export function CartDrawer() {
  // The side cart is redundant on the full cart / checkout pages, so it never opens there
  // (whatever triggers it: header icon, bottom nav, add-to-cart).
  const pathname = usePathname();
  // trailingSlash is on, so the path arrives as "/cart/".
  const onCartPage = /^\/(cart|checkout)\/?$/.test(pathname);
  const isOpen = useCartStore((s) => s.isDrawerOpen) && !onCartPage;
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Items value only — coupon discount and shipping belong to the cart/checkout totals, not the side cart.
  const cartTotal = Number(cart.subtotal) || 0;
  const { threshold, msgRemaining, msgReachedDrawer } = useFreeShipping();
  const remaining = Math.max(0, threshold - cartTotal);
  const progress = Math.min(100, (cartTotal / threshold) * 100);

  // Reset the stored flag on these pages so the drawer doesn't pop open after navigating away.
  useEffect(() => {
    if (onCartPage) closeDrawer();
  }, [onCartPage, closeDrawer]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeDrawer]);

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
        className={`fixed inset-y-0 end-0 z-[95] flex w-[90%] max-w-[340px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="עגלת קניות"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-[15px] py-5">
          <p className="text-[20.8px] font-bold leading-[29px] text-[#0c0c0c]">עגלת קניות</p>
          <button
            onClick={closeDrawer}
            aria-label="סגירה"
            className="flex items-center gap-1 text-[16px] font-semibold leading-none text-[#333] hover:text-brand-accent"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
            <span>לסגירה</span>
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
            <ul className="thin-scrollbar flex-1 overflow-y-auto">
              {cart.items.map((item) => {
                const unit = item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0;
                const regular = Number(item.regularPrice);
                const onSale = Number.isFinite(regular) && regular > unit + 0.001;
                return (
                  <li key={item.key} className="relative flex gap-[15px] border-b border-black/5 p-[15px] transition-colors hover:bg-black/[0.04]">
                    {item.product.image ? (
                      <Link
                        prefetch={false}
                        href={`/product/${item.product.slug}`}
                        onClick={closeDrawer}
                        className="relative block h-[65px] w-[65px] shrink-0"
                      >
                        <Image
                          src={item.product.image.src}
                          alt={item.product.image.alt || item.product.name}
                          fill
                          sizes="65px"
                          className="object-cover"
                        />
                      </Link>
                    ) : null}

                    <div className="min-w-0 flex-1 pe-5 text-start">
                      <p className="mb-2 line-clamp-3 text-[16px] leading-[1.4] text-black">
                        <Link
                          prefetch={false}
                          href={`/product/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="transition-colors hover:text-brand-accent"
                        >
                          {item.product.name}
                        </Link>
                      </p>
                      {item.variation ? (
                        <p className="text-[14.4px] leading-5 text-[#0c0c0c]">{item.variation.name}</p>
                      ) : null}
                      {item.product.sku ? (
                        <p className="mb-[5px] text-[14px] leading-5 text-[#0c0c0c]">
                          <span className="font-bold text-[#333]">מק&quot;ט:</span> {item.product.sku}
                        </p>
                      ) : null}

                      {item.locked ? null : <div className="mb-2 flex h-8 w-fit items-center rounded-full border border-black/10 text-[13px] text-[#0c0c0c]">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="הפחת כמות"
                          className="flex h-full w-8 items-center justify-center text-black/60 hover:text-brand-accent disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-semibold tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                          aria-label="הוסף כמות"
                          className="flex h-full w-8 items-center justify-center text-black/60 hover:text-brand-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>}

                      <p className="flex flex-wrap items-baseline gap-x-1.5 text-[14px] leading-6 text-[#bbb]">
                        <span>{item.quantity} ×</span>
                        {onSale ? <span className="line-through">{formatPrice(item.regularPrice!)}</span> : null}
                        <span className={`text-[14px] ${onSale ? "font-bold text-brand-accent" : "text-[#0c0c0c]"}`}>
                          {formatPrice(unit.toFixed(2))}
                        </span>
                      </p>
                    </div>

                    {item.locked ? null : (
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label="הסרה"
                        className="absolute left-[10px] top-[13px] flex h-5 w-5 items-center justify-center rounded-full text-[#333] hover:bg-brand-accent/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-black/10 pb-[15px]">
              <div className="flex items-center justify-between p-[15px] text-[20.8px] font-semibold leading-[29px] text-[#242424]">
                <span>סכום ביניים:</span>
                <span className="text-brand-accent font-bold">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="border-t border-black/10 p-[15px]">
                <p className="text-center text-[16px] leading-[22px] text-[#0c0c0c]">
                  {remaining > 0
                    ? renderShippingMessage(msgRemaining, formatPrice(remaining.toFixed(2)), "font-bold text-brand-accent")
                    : msgReachedDrawer}
                </p>
                <div className="mt-[10px] h-[7px] w-full bg-black/[0.06]">
                  <div
                    className="h-full bg-[repeating-linear-gradient(45deg,var(--color-brand-accent)_0_8px,#ff6b72_8px_16px)] transition-[width] duration-300"
                    style={{ width: progress + "%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[10px] px-[15px]">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex h-[42px] items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 text-[21px] font-semibold leading-[25px] text-white transition-transform hover:-translate-y-0.5"
                >
                  מעבר לסל הקניות
                </Link>
                {Number(cart.total) > 0 ? (
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex h-[42px] items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 text-[21px] font-semibold leading-[25px] text-white transition-transform hover:-translate-y-0.5"
                  >
                    תשלום
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex h-[42px] cursor-not-allowed items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 text-[21px] font-semibold leading-[25px] text-white opacity-50"
                  >
                    תשלום
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
