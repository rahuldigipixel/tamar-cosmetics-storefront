"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { RelatedToCartProducts } from "@/components/cart/RelatedToCartProducts";

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const selectShippingMethod = useCartStore((s) => s.selectShippingMethod);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shippingUpdating, setShippingUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } catch (err) {
      setCouponError((err as Error).message || "קוד קופון לא תקין");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handleSelectShipping(methodId: string) {
    if (methodId === cart.chosenShippingMethod) return;
    setShippingUpdating(true);
    try {
      await selectShippingMethod(methodId);
    } finally {
      setShippingUpdating(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-[15px] py-20 text-center ">
        <ShoppingBag className="mx-auto h-16 w-16 text-black/15" />
        <h1 className="mt-4 text-2xl font-bold">העגלה שלך ריקה</h1>
        <p className="mt-2 text-base text-black/50">עדיין לא הוספת מוצרים לעגלה.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          המשך בקניות
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-[15px] py-8 ">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">עגלת קניות</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white">
            {cart.items.map((item) => {
              const unitPrice = item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0;
              return (
              <li key={item.key} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                {item.product.image ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-soft/30">
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
                  <Link href={`/product/${item.product.slug}`} className="text-base font-medium hover:text-brand-accent">
                    {item.product.name}
                  </Link>
                  {item.variation ? <p className="mt-0.5 text-sm text-black/50">{item.variation.name}</p> : null}
                  {item.product.sku ? (
                    <p className="mt-0.5 text-sm text-black/40">
                      מק&quot;ט: {item.product.sku} &middot; {formatPrice(unitPrice)} ליחידה
                    </p>
                  ) : null}
                </div>

                <div className="flex h-10 shrink-0 items-center rounded-full border border-black/10">
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="הפחת כמות"
                    className="flex h-full w-10 items-center justify-center text-black/60 transition-colors hover:text-brand-accent disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-base font-semibold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                    aria-label="הוסף כמות"
                    className="flex h-full w-10 items-center justify-center text-black/60 transition-colors hover:text-brand-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <span className="w-24 shrink-0 text-left text-lg font-bold text-brand-accent">
                  {formatPrice(item.total)}
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label="הסרה"
                  className="shrink-0 rounded-full p-2 text-black/30 hover:bg-black/5 hover:text-brand-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
              );
            })}
          </ul>

          <form onSubmit={handleApplyCoupon} className="mt-6 rounded-2xl border border-black/5 bg-white p-4">
            <label className="mb-2 flex items-center gap-1.5 text-base font-semibold text-black/70">
              <Tag className="h-4 w-4" />
              יש לך קוד קופון?
            </label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="קוד קופון"
                className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-base outline-none focus:border-brand-accent"
              />
              <button
                type="submit"
                disabled={applyingCoupon || !couponInput.trim()}
                className="rounded-full bg-black px-6 py-2.5 text-base font-semibold text-white disabled:opacity-50"
              >
                {applyingCoupon ? "מחיל..." : "החלת קופון"}
              </button>
            </div>
            {couponError ? <p className="mt-2 text-base text-red-600">{couponError}</p> : null}

            {cart.appliedCoupons.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {cart.appliedCoupons.map((c) => (
                  <li
                    key={c.code}
                    className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-base font-semibold text-brand-accent"
                  >
                    {c.code}
                    <button type="button" onClick={() => removeCoupon(c.code)} aria-label="הסרת קופון">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-xl font-bold">סיכום הזמנה</h2>

          {cart.shippingRates.length > 0 ? (
            <div className="mb-4 space-y-2 border-b border-black/5 pb-4">
              <p className="text-base font-semibold text-black/70">אופן משלוח</p>
              {cart.shippingRates.map((rate) => (
                <label
                  key={rate.id}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 text-base transition-colors ${
                    cart.chosenShippingMethod === rate.id ? "border-brand-accent bg-brand-soft/40" : "border-black/10"
                  } ${shippingUpdating ? "opacity-60" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shippingMethod"
                      disabled={shippingUpdating}
                      checked={cart.chosenShippingMethod === rate.id}
                      onChange={() => handleSelectShipping(rate.id)}
                      className="h-4 w-4 accent-brand-accent"
                    />
                    {rate.label}
                  </span>
                  <span className="font-medium">{Number(rate.cost) > 0 ? formatPrice(rate.cost) : "חינם"}</span>
                </label>
              ))}
            </div>
          ) : null}

          <div className="space-y-2 border-b border-black/5 pb-4 text-base">
            <div className="flex justify-between">
              <span className="text-black/60">סכום ביניים</span>
              <span className="font-medium">{formatPrice(cart.subtotal)}</span>
            </div>
            {Number(cart.discountTotal) > 0 ? (
              <div className="flex justify-between text-brand-accent">
                <span>הנחה</span>
                <span>-{formatPrice(cart.discountTotal)}</span>
              </div>
            ) : null}
            {Number(cart.shippingTotal) > 0 ? (
              <div className="flex justify-between">
                <span className="text-black/60">משלוח</span>
                <span className="font-medium">{formatPrice(cart.shippingTotal)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between py-4 text-xl font-bold">
            <span>סה&quot;כ לתשלום</span>
            <span className="text-brand-accent">{formatPrice(cart.total)}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-3.5 text-center text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            מעבר לתשלום
          </Link>
        </aside>
      </div>

      <RelatedToCartProducts items={cart.items} />
    </div>
  );
}
