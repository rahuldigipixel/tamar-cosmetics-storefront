"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { FlashyCartWidget } from "@/components/cart/FlashyCartWidget";
import { ShippingAddressPicker } from "@/components/cart/ShippingAddressPicker";
import { PRIMARY_BTN } from "@/components/cart/cartStyles";

// Cart page cloned from the live WooCommerce cart (tamarcosmetics.co.il/cart): every size, colour,
// padding and alignment below is the measured computed value, so the <18px text is an approved
// exception (see AGENTS.md). Like the original, almost everything is physically left-aligned
// (`text-left`) while the items table cells are right-aligned — hence physical left/right classes
// here instead of start/end. Breakpoints are the original's: side-by-side from 1025px (items 57% →
// 2/3 from 1200px), items table collapses into cards at ≤768px, 18px text at ≤767px.
// Buttons use the site theme (gradient + hover lift), not the original's flat pink.
// NB: Tailwind only sees complete class names — never build a variant-prefixed class by interpolation.
const HAIRLINE = "border-black/[0.106]";
const TH =
  "border-b-2 border-black/[0.075] px-[10px] py-[15px] text-right align-middle text-[16px] font-bold leading-[22.4px] text-[#0c0c0c]";
// Table cell on ≥769px; below that every cell becomes a "label … value" flex row (label from data-title).
const TD = `border-b ${HAIRLINE} min-[769px]:table-cell min-[769px]:px-3 min-[769px]:py-[15px] min-[769px]:align-middle`;
const MOBILE_ROW =
  "mb-[5px] flex items-center before:flex-1 before:text-right before:text-[11px] before:font-semibold before:text-[#242424] before:content-[attr(data-title)] min-[769px]:mb-0 min-[769px]:before:hidden";

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItemQuantities = useCartStore((s) => s.updateItemQuantities);
  const shippingAddress = useCartStore((s) => s.shippingAddress);
  const changeShippingAddress = useCartStore((s) => s.changeShippingAddress);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const selectShippingMethod = useCartStore((s) => s.selectShippingMethod);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shippingUpdating, setShippingUpdating] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  // Quantity edits stay local until "לעדכן סל קניות" is pressed (same as the legacy cart).
  const [pendingQty, setPendingQty] = useState<Record<string, number>>({});
  const [updatingCart, setUpdatingCart] = useState(false);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changedItems = cart.items
    .filter((i) => pendingQty[i.key] !== undefined && pendingQty[i.key] !== i.quantity)
    .map((i) => ({ key: i.key, quantity: pendingQty[i.key] }));

  // Like WooCommerce, quantity can go down to 0 — "update cart" then removes that line.
  function setQty(key: string, next: number) {
    setPendingQty((prev) => ({ ...prev, [key]: Math.max(0, next) }));
  }

  async function handleUpdateCart() {
    if (changedItems.length === 0) return;
    setUpdatingCart(true);
    try {
      await updateItemQuantities(changedItems);
      setPendingQty({});
    } finally {
      setUpdatingCart(false);
    }
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
      setCouponSuccess("קוד הקופון הוחל בהצלחה.");
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
      <div className="mx-auto max-w-[1600px] px-[25px] py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-black/15" />
        <h1 className="mt-4 text-2xl font-bold">סל הקניות שלך ריק כרגע.</h1>
        <Link href="/shop" className={`${PRIMARY_BTN} mt-6 px-8 py-3 text-base font-semibold`}>
          חזור לחנות
        </Link>
        <div className="mt-12">
          <FlashyCartWidget />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-[25px] pb-12 pt-[50px] text-left text-[12px] leading-[1.6] text-black max-[768px]:text-[18px]">
      <div className="grid grid-cols-[minmax(0,1fr)] min-[1025px]:grid-cols-[57%_minmax(0,1fr)] min-[1025px]:gap-x-[30px] min-[1200px]:grid-cols-[calc(66.6667%-15px)_calc(33.3333%-15px)]">
        {/* ── items column ── */}
        <div className="order-1 mb-[40px] min-w-0 min-[1025px]:mb-0">
          {/* 1 · free-shipping progress */}
          <FreeShippingBar cart={cart} className="mb-5" />

          {/* 2 · items table */}
          <table className="block w-full border-collapse min-[769px]:table">
            <thead className="hidden min-[769px]:table-header-group">
              <tr>
                <th className={`${TH} w-[40px] !p-0`}>
                  <span className="sr-only">להסיר פריט</span>
                </th>
                <th className={TH}>
                  <span className="sr-only">תמונה ממוזערת</span>
                </th>
                <th className={TH}>מוצר</th>
                <th className={TH}>מק&quot;ט</th>
                <th className={TH}>מחיר</th>
                <th className={TH}>כמות</th>
                <th className={`${TH} !text-left`}>סכום ביניים</th>
              </tr>
            </thead>
            <tbody className="block min-[769px]:table-row-group">
              {cart.items.map((item) => {
                const unitPrice = item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0;
                const regularPrice = Number(item.regularPrice);
                const onSale = Number.isFinite(regularPrice) && regularPrice > unitPrice + 0.001;
                const href = `/product/${item.product.slug}`;
                const shownQty = pendingQty[item.key] ?? item.quantity;
                return (
                  <tr
                    key={item.key}
                    className="relative block border-b border-black/[0.106] pb-[25px] pr-[115px] text-[14px] leading-[1.4] min-[769px]:table-row min-[769px]:border-b-0 min-[769px]:p-0"
                  >
                    {/* remove — top-left corner of the card on mobile */}
                    <td className="absolute left-[-7px] top-[-7px] flex text-center min-[769px]:static min-[769px]:table-cell min-[769px]:w-[40px] min-[769px]:border-b min-[769px]:border-black/[0.106] min-[769px]:align-middle">
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label="הסרה"
                        className="mx-auto flex h-[30px] w-[30px] items-center justify-center text-[#333] transition-colors hover:text-brand-accent"
                      >
                        <X className="h-5 w-5" strokeWidth={1.2} />
                      </button>
                    </td>
                    {/* thumbnail — top-right of the card on mobile */}
                    <td className="absolute right-0 top-0 w-[100px] min-[769px]:static min-[769px]:table-cell min-[769px]:w-auto min-[769px]:border-b min-[769px]:border-black/[0.106] min-[769px]:px-3 min-[769px]:py-[15px] min-[769px]:align-middle min-[769px]:text-right">
                      {item.product.image ? (
                        <Link
                          prefetch={false}
                          href={href}
                          className="relative block h-[100px] w-[100px] min-[769px]:h-[80px] min-[769px]:w-[80px]"
                        >
                          <Image
                            src={item.product.image.src}
                            alt={item.product.image.alt || item.product.name}
                            fill
                            sizes="(max-width: 768px) 100px, 80px"
                            className="object-contain"
                          />
                        </Link>
                      ) : null}
                    </td>
                    <td className={`${TD} mb-[10px] block border-b-0 pl-[20px] text-right min-[769px]:mb-0 min-[769px]:border-b min-[769px]:pl-3`}>
                      <Link prefetch={false} href={href} className="text-black transition-colors hover:text-brand-accent">
                        {item.product.name}
                      </Link>
                      {item.variation ? <p className="text-[#777]">{item.variation.name}</p> : null}
                    </td>
                    <td data-title='מק"ט' className={`${TD} ${MOBILE_ROW} text-left min-[769px]:text-right`}>
                      {item.product.sku ?? ""}
                    </td>
                    <td data-title="מחיר" className={`${TD} ${MOBILE_ROW} text-left min-[769px]:text-right`}>
                      <span className={onSale ? "font-semibold text-brand-accent" : "text-[#777]"}>{formatPrice(unitPrice)}</span>
                      {onSale ? (
                        <span className="mx-[6px] inline-block text-[#777] line-through">{formatPrice(item.regularPrice!)}</span>
                      ) : null}
                    </td>
                    <td data-title="כמות" className={`${TD} ${MOBILE_ROW} text-left min-[769px]:text-right`}>
                      {/* Controls sit at the top-left of a 45px box, as in the original */}
                      <div className="flex h-[45px] items-start justify-end pl-[5px] min-[769px]:w-[110px]">
                        <button
                          type="button"
                          onClick={() => setQty(item.key, shownQty - 1)}
                          aria-label="הפחת כמות"
                          className="h-[25px] w-[25px] rounded-full px-[5px] text-[13px] font-semibold leading-[15.6px] transition-colors hover:text-brand-accent"
                        >
                          -
                        </button>
                        <span className="h-[25px] w-[25px] text-center text-[14px] leading-[25px] tabular-nums min-[769px]:w-[30px]">
                          {shownQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.key, shownQty + 1)}
                          aria-label="הוסף כמות"
                          className="h-[25px] w-[25px] rounded-full px-[5px] text-[13px] font-semibold leading-[15.6px] transition-colors hover:text-brand-accent"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td data-title="סכום ביניים" className={`${TD} ${MOBILE_ROW} max-[769px]:!mb-0 max-[769px]:border-b-0 text-left`}>
                      <span className="text-[16px] font-semibold text-brand-accent">{formatPrice(item.total)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 3 · update cart + coupon (update button above the coupon box on mobile) */}
          <div className="flex flex-col min-[769px]:flex-row min-[769px]:justify-between">
            <form
              onSubmit={handleApplyCoupon}
              className="order-2 mt-[40px] flex flex-col border-2 border-dashed border-black/[0.106] px-[25px] pb-[25px] pt-[60px] min-[481px]:flex-row min-[481px]:items-center min-[481px]:gap-[20px] min-[481px]:py-[25px] min-[481px]:pr-[35px] min-[769px]:order-1 min-[769px]:mt-[30px] min-[769px]:min-w-0 min-[769px]:flex-1 min-[769px]:justify-start min-[769px]:border-0 min-[769px]:p-0 min-[769px]:pr-[10px]"
            >
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="קוד קופון"
                aria-label="קוד קופון"
                className="h-[42px] w-full rounded-[35px] border-2 border-black/10 bg-transparent px-[15px] text-[14px] leading-[19.6px] outline-none placeholder:text-black transition-colors focus:border-brand-accent min-[481px]:w-auto min-[481px]:flex-1 min-[769px]:w-[230px] min-[769px]:flex-none"
              />
              <button
                type="submit"
                disabled={applyingCoupon || !couponInput.trim()}
                className={`${PRIMARY_BTN} mt-[46px] h-[42px] px-5 text-[13px] font-semibold leading-[15.6px] min-[481px]:mt-0 min-[769px]:shrink-0`}
              >
                {applyingCoupon ? "מחיל..." : "החלת קופון"}
              </button>
            </form>
            <button
              type="button"
              onClick={handleUpdateCart}
              disabled={changedItems.length === 0 || updatingCart}
              className={`${PRIMARY_BTN} order-1 mt-[30px] h-[42px] self-start px-5 text-[13px] font-semibold leading-[15.6px] min-[769px]:order-2 min-[769px]:ml-[20px] min-[769px]:self-auto`}
            >
              {updatingCart ? "מעדכן..." : "לעדכן סל קניות"}
            </button>
          </div>
          {couponError ? (
            <p role="alert" className="mt-4 rounded-[6px] border border-brand-accent/30 bg-brand-soft px-4 py-3 text-right text-[14px] font-semibold text-brand-accent">
              {couponError}
            </p>
          ) : null}
          {couponSuccess ? (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 rounded-[6px] border border-[#2e7d32]/30 bg-[#e8f5e9] px-4 py-3 text-right text-[14px] font-semibold text-[#2e7d32]"
            >
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              {couponSuccess}
            </p>
          ) : null}

          <a
            href="/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%A9%D7%9C%D7%95%D7%97%D7%99%D7%9D-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%9E%D7%94%D7%99%D7%95%D7%9D-%D7%9C%D7%94%D7%99%D7%95%D7%9D/"
            target="_blank"
            rel="noopener"
            className="block text-left text-[#333] hover:text-brand-accent"
          >
            מדיניות משלוחים בירושלים מ-&apos;היום להיום&apos;
          </a>
        </div>

        {/* 5 · Flashy recommendations: below everything on desktop/tablet, between items and totals on mobile */}
        <div className="order-3 min-w-0 min-[768px]:mt-[20px] max-[768px]:order-2 min-[1025px]:col-span-2">
          <FlashyCartWidget />
        </div>

        {/* 4 · totals + shipping + checkout */}
        <aside className="order-2 h-fit min-w-0 border-[3px] border-black/[0.075] p-[25px] max-[768px]:order-3 min-[1025px]:col-start-2 min-[1025px]:row-start-1">
          <h2 className="mb-[15px] text-left text-[22px] font-bold leading-[30.8px] text-[#0c0c0c] min-[769px]:pr-[6px]">
            סה&quot;כ בסל הקניות
          </h2>

          <table className="block w-full border-collapse min-[769px]:table">
            <tbody className="block min-[769px]:table-row-group">
              <TotalsRow title="סכום ביניים">
                <span className="text-[#777]">{formatPrice(cart.subtotal)}</span>
              </TotalsRow>

              {/* One row per applied coupon with its own discount + remove link, like WooCommerce */}
              {cart.appliedCoupons.map((c) => (
                <TotalsRow key={c.code} title={`קופון: ${c.code}`}>
                  <span className="text-brand-accent">-{formatPrice(c.discountAmount)}</span>{" "}
                  <button
                    type="button"
                    onClick={() => removeCoupon(c.code)}
                    className="text-[#333] underline hover:text-brand-accent"
                  >
                    [הסרה]
                  </button>
                </TotalsRow>
              ))}
              {cart.appliedCoupons.length === 0 && Number(cart.discountTotal) > 0 ? (
                <TotalsRow title="הנחה">
                  <span className="text-brand-accent">-{formatPrice(cart.discountTotal)}</span>
                </TotalsRow>
              ) : null}

              <TotalsRow title="משלוח">
                {cart.shippingRates.length > 0 ? (
                  <ul className={`m-0 list-none p-0 text-left ${shippingUpdating ? "opacity-60" : ""}`}>
                    {cart.shippingRates.map((rate) => (
                      <li key={rate.id} className="mb-[10px]">
                        {/* radio floats left of the (left-aligned) label text, like the original */}
                        <label className="block cursor-pointer text-left text-[#0c0c0c]">
                          <input
                            type="radio"
                            name="shippingMethod"
                            disabled={shippingUpdating}
                            checked={cart.chosenShippingMethod === rate.id}
                            onChange={() => handleSelectShipping(rate.id)}
                            className="relative top-[4px] float-left mr-[7px] h-[13px] w-[13px] accent-[#0075ff]"
                          />
                          {/* Full method title (never truncated); the price sits on its own line, as in WooCommerce. */}
                          <span className="break-words">
                            {rate.label}
                            {Number(rate.cost) > 0 ? ":" : ""}
                          </span>
                          {Number(rate.cost) > 0 ? (
                            <span className="mt-[2px] block font-semibold text-brand-accent">{formatPrice(rate.cost)}</span>
                          ) : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="my-[10px]">
                  {shippingAddress?.city ? (
                    <>
                      משלוח אל <strong>{shippingAddress.city}</strong>.
                    </>
                  ) : (
                    "אפשרויות המשלוח יעודכנו במהלך התשלום בקופה."
                  )}
                </p>
                <p className="mb-[20px]">
                  <button
                    type="button"
                    onClick={() => setEditingAddress((open) => !open)}
                    aria-expanded={editingAddress}
                    className="font-semibold text-brand-accent hover:underline"
                  >
                    {shippingAddress?.city ? "שינוי הכתובת" : "חישוב המשלוח"}
                  </button>
                </p>
                {editingAddress ? (
                  <ShippingAddressPicker
                    currentState={shippingAddress?.state}
                    onSubmit={changeShippingAddress}
                    onDone={() => setEditingAddress(false)}
                  />
                ) : null}
              </TotalsRow>

              <TotalsRow title={'סה"כ'} last>
                <span className="text-[22px] font-semibold text-brand-accent max-[769px]:text-[18px]">
                  {formatPrice(cart.total)}
                </span>
              </TotalsRow>
            </tbody>
          </table>

          <div className="mb-[15px] mt-[15px] min-[769px]:mt-[16px]">
            <Link
              href="/checkout"
              className={`${PRIMARY_BTN} h-[42px] w-full px-5 text-[21px] font-semibold leading-[25.2px]`}
            >
              מעבר לתשלום
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

// One row of the totals table: label cell (right) + value cell (left) on ≥769px; on mobile the label
// moves into the value cell as a right-floated ::before (from data-title) and the row becomes a block.
function TotalsRow({ title, last, children }: { title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <tr
      className={`block min-[769px]:table-row ${
        last
          ? ""
          : "mb-[15px] border-b border-black/[0.106] pb-[15px] min-[769px]:mb-0 min-[769px]:border-b-0 min-[769px]:pb-0"
      }`}
    >
      <th
        className={`hidden whitespace-nowrap px-[10px] py-[15px] text-right align-middle font-bold text-[#0c0c0c] min-[769px]:table-cell ${
          last ? "text-[18px] leading-[25.2px]" : "border-b border-black/[0.106] text-[12px] leading-[16.8px]"
        }`}
      >
        {title}
      </th>
      <td
        data-title={title}
        className={`block p-0 text-left align-middle leading-[1.4] before:float-right before:text-[14px] before:font-bold before:text-[#0c0c0c] before:content-[attr(data-title)] min-[769px]:table-cell min-[769px]:px-3 min-[769px]:py-[15px] min-[769px]:before:hidden ${
          last ? "" : "min-[769px]:border-b min-[769px]:border-black/[0.106]"
        }`}
      >
        {children}
      </td>
    </tr>
  );
}
