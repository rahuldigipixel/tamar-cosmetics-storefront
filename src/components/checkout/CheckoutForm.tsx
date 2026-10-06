"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { PRIMARY_BTN } from "@/components/cart/cartStyles";
import { StreetSelect } from "@/components/checkout/StreetSelect";

// Checkout cloned from the live WooCommerce checkout (tamarcosmetics.co.il/checkout): sizes, weights,
// paddings and radii are the measured computed values (Playwright, 1440px + 390px), so the <18px text is
// an approved exception at the user's explicit request (see AGENTS.md) — same as /cart.
// Field set = wps-woo-extended's `custom_override_checkout_fields`: name, city (select), street (searchable
// select), building, apartment (required), phone, email. Shipping + payment methods come from WooCommerce.
const HAIRLINE = "border-black/[0.106]";
const INPUT =
  "h-[42px] w-full rounded-[35px] border-2 border-black/10 bg-transparent px-[15px] text-[14px] leading-[22.4px] text-black outline-none transition-colors placeholder:text-black focus:border-brand-accent aria-[invalid=true]:border-brand-accent";
const SELECT = `${INPUT} appearance-none pl-[40px]`;
const H3 =
  "mb-[20px] text-[22px] font-bold leading-[30.8px] text-[#0c0c0c] max-[767px]:mb-[10px] max-[767px]:text-[17px] max-[767px]:leading-[23.8px]";
const TH = `border-b-2 border-black/[0.075] px-[10px] py-[15px] text-start align-middle text-[16px] font-bold leading-[22.4px] text-[#0c0c0c] max-[767px]:px-[3px]`;
const BODY = "text-[21px] leading-[29.4px] max-[767px]:text-[13px] max-[767px]:leading-[18.2px]";
const TD = `border-b ${HAIRLINE} ${BODY} px-3 py-[15px] align-middle max-[767px]:px-[3px]`;
const ROW_TH = `flex items-center whitespace-nowrap border-b ${HAIRLINE} px-[10px] py-[15px] text-start align-middle ${BODY} font-bold text-[#0c0c0c] max-[767px]:px-[3px]`;
const CHECK_LABEL =
  "flex cursor-pointer items-start gap-[5px] text-[17px] leading-[24px] text-[#0c0c0c] max-[767px]:text-[13px] max-[767px]:leading-[20.8px]";
const TERMS_LABEL =
  "flex cursor-pointer items-start gap-[5px] text-[21px] leading-[21px] text-[#0c0c0c] max-[767px]:text-[13px] max-[767px]:leading-[20.8px]";
const CHECKBOX = "mt-[3px] h-[13px] w-[13px] shrink-0 accent-brand-accent";

interface City {
  code: string;
  name: string;
}

type FieldKey = "first_name" | "state" | "address_1" | "appartment" | "phone" | "email" | "terms";

const REQUIRED_LABELS: Record<FieldKey, string> = {
  first_name: "שם מלא או שם חברה על גבי חשבונית",
  state: "עיר",
  address_1: "רחוב",
  appartment: "מספר דירה",
  phone: "טלפון",
  email: "כתובת אימייל",
  terms: "תנאי שימוש האתר",
};

const FIELD_IDS: Record<FieldKey, string> = {
  first_name: "billing_first_name",
  state: "billing_state",
  address_1: "billing_address_1",
  appartment: "billing_appartment",
  phone: "billing_phone",
  email: "billing_email",
  terms: "terms",
};

export function CheckoutForm({ notice }: { notice: string }) {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const checkoutReady = useCartStore((s) => s.checkoutReady);
  const gateways = useCartStore((s) => s.paymentGateways);
  const shippingAddress = useCartStore((s) => s.shippingAddress);
  const sessionToken = useCartStore((s) => s.sessionToken);
  const fetchCheckoutCart = useCartStore((s) => s.fetchCheckoutCart);
  const changeShippingAddress = useCartStore((s) => s.changeShippingAddress);
  const selectShippingMethod = useCartStore((s) => s.selectShippingMethod);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  const [cities, setCities] = useState<City[] | null>(null);
  const [form, setForm] = useState({ first_name: "", address_2: "", appartment: "", phone: "", email: "" });
  const [stateCode, setStateCode] = useState<string | null>(null); // null = follow the cart's shipping city
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [terms, setTerms] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shippingUpdating, setShippingUpdating] = useState(false);

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    void fetchCheckoutCart();
    let cancelled = false;
    fetch("/api/shipping-cities")
      .then((res) => res.json())
      .then((data: City[]) => {
        if (!cancelled) setCities(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PayPal "Debit & Credit Cards" (ppcp-*) needs PayPal's browser SDK — it can't complete through the headless checkout.
  const availableGateways = gateways.filter((g) => !g.id.startsWith("ppcp"));
  const activePayment = availableGateways.find((g) => g.id === paymentId) ?? availableGateways[0] ?? null;

  const effectiveState = stateCode ?? shippingAddress?.state ?? "";
  const cityName =
    cities?.find((c) => c.code === effectiveState)?.name ??
    (shippingAddress?.state === effectiveState ? shippingAddress?.city : "") ??
    "";

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleCityChange(code: string) {
    setStateCode(code);
    setStreet("");
    setErrors((prev) => ({ ...prev, state: undefined, address_1: undefined }));
    const city = cities?.find((c) => c.code === code);
    if (!city) return;
    setShippingUpdating(true);
    try {
      // WooCommerce re-evaluates its shipping zones for the city (e.g. Jerusalem unlocks pickup).
      await changeShippingAddress(city.code, city.name);
    } catch {
      /* rates stay as they were; the order itself re-validates on submit */
    } finally {
      setShippingUpdating(false);
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

  function validate() {
    const found: Partial<Record<FieldKey, string>> = {};
    const required = (key: FieldKey, value: string) => {
      if (!value.trim()) found[key] = `${REQUIRED_LABELS[key]} הינו שדה חובה.`;
    };
    required("first_name", form.first_name);
    required("state", effectiveState);
    required("address_1", street);
    required("appartment", form.appartment);
    required("phone", form.phone);
    required("email", form.email);
    if (!found.phone && !/^[0-9+\-\s()]{7,}$/.test(form.phone.trim())) found.phone = "מספר הטלפון אינו תקין.";
    if (!found.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = "כתובת האימייל אינה תקינה.";
    if (!terms) found.terms = "יש לאשר את תנאי השימוש של האתר.";
    return found;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const found = validate();
    setErrors(found);
    const firstKey = (Object.keys(FIELD_IDS) as FieldKey[]).find((k) => found[k]);
    if (firstKey) {
      document.getElementById(FIELD_IDS[firstKey])?.focus();
      return;
    }
    if (!activePayment) {
      setSubmitError("לא נמצא אמצעי תשלום זמין.");
      return;
    }

    const address = {
      first_name: form.first_name.trim(),
      address_1: street,
      address_2: form.address_2.trim(),
      appartment: form.appartment.trim(),
      state: effectiveState,
      city: cityName,
      country: "IL" as const,
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { "X-Cart-Session": sessionToken } : {}),
        },
        body: JSON.stringify({
          billing_address: address,
          shipping_address: address,
          payment_method: activePayment.id,
          customer_note: note.trim() || undefined,
          accept_marketing: acceptMarketing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה בביצוע ההזמנה");

      const redirect: string | undefined = data.payment_result?.redirect_url;
      if (redirect && !redirect.includes("order-received")) {
        // Hosted payment page (GoCredit): the order is created, the cart is consumed.
        clearCart();
        window.location.assign(redirect);
      } else {
        clearCart();
        router.push(`/checkout/success?order=${data.order_id}`);
      }
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (!checkoutReady) return <CheckoutSkeleton />;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-[25px] py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-black/15" />
        <h1 className="mt-4 text-2xl font-bold">אין מוצרים לתשלום</h1>
        <Link href="/shop" className={`${PRIMARY_BTN} mt-6 px-8 py-3 text-base font-semibold`}>
          חזור לחנות
        </Link>
      </div>
    );
  }

  const errorList = (Object.keys(FIELD_IDS) as FieldKey[]).filter((k) => errors[k]);
  const multiGateway = availableGateways.length > 1;
  const TOGGLE = "mb-[25px] font-semibold text-[#242424]";
  const LINK_BTN = "font-semibold text-brand-accent underline hover:no-underline";

  return (
    <>
      <div className="mx-auto max-w-[1600px] px-[25px] pb-[10px] pt-[50px] text-[16px] leading-[1.6] text-black">
        {/* login + coupon toggles */}
        <div className={`${TOGGLE} text-[21px] leading-[33.6px] max-[767px]:mb-[10px] max-[767px]:text-[16px] max-[767px]:leading-[18px]`}>
          קנית כאן בעבר?{" "}
          <Link prefetch={false} href="/account/login" className={LINK_BTN}>
            יש ללחוץ כאן כדי להתחבר
          </Link>
        </div>
        <div className={`${TOGGLE} text-[16px] leading-[25.6px]`}>
          יש לך קופון?{" "}
          <button type="button" aria-expanded={couponOpen} onClick={() => setCouponOpen((o) => !o)} className={LINK_BTN}>
            לחצו כאן
          </button>
        </div>
        {couponOpen ? (
          <form onSubmit={handleApplyCoupon} className="mb-[25px] border-2 border-black/[0.075] p-[30px] max-[767px]:p-[20px]">
            <p className="mb-[15px]">אם יש לך קוד קופון, אנא הזן אותו להלן.</p>
            <div className="flex flex-col gap-[10px] min-[481px]:flex-row min-[481px]:items-center min-[481px]:gap-[20px]">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="קוד קופון"
                aria-label="קוד קופון"
                className={`${INPUT} min-[481px]:w-[230px]`}
              />
              <button
                type="submit"
                disabled={applyingCoupon || !couponInput.trim()}
                className={`${PRIMARY_BTN} h-[42px] px-5 text-[13px] font-semibold leading-[15.6px]`}
              >
                {applyingCoupon ? "מחיל..." : "החלת קופון"}
              </button>
            </div>
          </form>
        ) : null}
        {couponError ? (
          <p role="alert" className="mb-[25px] rounded-[6px] border border-brand-accent/30 bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand-accent">
            {couponError}
          </p>
        ) : null}
        {couponSuccess ? (
          <p role="status" className="mb-[25px] flex items-center gap-2 rounded-[6px] border border-[#2e7d32]/30 bg-[#e8f5e9] px-4 py-3 text-[14px] font-semibold text-[#2e7d32]">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            {couponSuccess}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} noValidate id="checkout-form">
          {errorList.length > 0 || submitError ? (
            <ul role="alert" className="mb-[25px] list-none border-t-[3px] border-brand-accent bg-brand-soft p-[15px] text-[14px] leading-[22px] text-[#0c0c0c]">
              {errorList.map((k) => (
                <li key={k}>
                  <a
                    href={`#${FIELD_IDS[k]}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(FIELD_IDS[k])?.focus();
                    }}
                    className="font-semibold hover:underline"
                  >
                    {errors[k]}
                  </a>
                </li>
              ))}
              {submitError ? <li className="font-semibold">{submitError}</li> : null}
            </ul>
          ) : null}

          <div className="grid grid-cols-1 gap-y-[40px] min-[769px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[769px]:gap-x-[30px]">
            {/* ── billing column ── */}
            <div className="min-w-0">
              <div className="text-[21px] leading-[1.6]">
                <FreeShippingBar cart={cart} className="mb-[30px]" />
              </div>

              <h3 className={H3}>חיוב ומשלוח</h3>
              <div className="flex flex-col gap-y-[20px]">
                <div className="flex flex-col gap-y-[20px] min-[769px]:flex-row min-[769px]:justify-between">
                <input
                  id="billing_first_name"
                  autoComplete="name"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  aria-invalid={!!errors.first_name || undefined}
                  placeholder="שם מלא או שם חברה על גבי חשבונית *"
                  className={`${INPUT} min-[769px]:w-[48%]`}
                />
                <div className="relative min-[769px]:w-[48%]">
                  <select
                    id="billing_state"
                    value={effectiveState}
                    disabled={cities === null}
                    onChange={(e) => void handleCityChange(e.target.value)}
                    aria-invalid={!!errors.state || undefined}
                    className={SELECT}
                  >
                    <option value="">{cities === null ? "טוען…" : "עיר (לבחור) *"}</option>
                    {(cities ?? []).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                </div>
                </div>
                <div>
                  <StreetSelect
                    id="billing_address_1"
                    city={cityName}
                    value={street}
                    onChange={(s) => {
                      setStreet(s);
                      setErrors((prev) => ({ ...prev, address_1: undefined }));
                    }}
                    invalid={!!errors.address_1}
                    className={INPUT}
                  />
                </div>
                <input
                  id="billing_address_2"
                  value={form.address_2}
                  onChange={(e) => setField("address_2", e.target.value)}
                  placeholder="בניין"
                  className={`${INPUT}`}
                />
                <input
                  id="billing_appartment"
                  value={form.appartment}
                  onChange={(e) => setField("appartment", e.target.value)}
                  aria-invalid={!!errors.appartment || undefined}
                  placeholder="מספר דירה *"
                  className={`${INPUT}`}
                />
                <input
                  id="billing_phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  aria-invalid={!!errors.phone || undefined}
                  placeholder="טלפון *"
                  className={`${INPUT}`}
                />
                <input
                  id="billing_email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  aria-invalid={!!errors.email || undefined}
                  placeholder="כתובת אימייל *"
                  className={`${INPUT}`}
                />
              </div>

              <h3 className={`${H3} mt-[40px] max-[767px]:mt-[30px]`}>מידע נוסף</h3>
              <textarea
                id="order_comments"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="הערות להזמנה"
                rows={5}
                className={`${INPUT} h-[100px] resize-y py-[10px]`}
              />
              <label className={`${CHECK_LABEL} mt-[15px]`}>
                <input
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  className={CHECKBOX}
                />
                <span>אני מסכימה לקבל דיוור פרסומי באמצעות מייל וסמס מחברת ע.צ.ת. תמר קוסמטיקס בע&quot;מ</span>
              </label>
            </div>

            {/* ── order review column (receipt box) ── */}
            <div className="min-w-0">
              <div
                className="relative bg-[#f5f5f5] px-[30px] pb-[30px] pt-[40px] before:absolute before:inset-x-0 before:top-0 before:h-[8px] before:bg-[radial-gradient(circle_at_5px_0,#fff_4px,transparent_4.5px)] before:bg-[length:10px_8px] after:absolute after:inset-x-0 after:bottom-0 after:h-[8px] after:bg-[radial-gradient(circle_at_5px_100%,#fff_4px,transparent_4.5px)] after:bg-[length:10px_8px] max-[767px]:px-[10px]"
              >
                <h3 className={`${H3} text-center`}>פרטי ההזמנה</h3>

                <table className={`block w-full bg-white ${shippingUpdating ? "opacity-70" : ""}`}>
                  <thead className="block">
                    <tr className="flex">
                      <th className={`${TH} min-w-0 flex-1`}>מוצר</th>
                      <th className={`${TH} shrink-0 whitespace-nowrap text-end`}>סכום ביניים</th>
                    </tr>
                  </thead>
                  <tbody className="block">
                    {cart.items.map((item) => (
                      <tr key={item.key} className="flex">
                        <td className={`${TD} min-w-0 flex-1`}>
                          {item.product.name}
                          {item.variation ? <span className="text-[#777]"> — {item.variation.name}</span> : null}{" "}
                          <strong className="font-semibold">&times;&nbsp;{item.quantity}</strong>
                        </td>
                        <td className={`${TD} shrink-0 text-end`}>
                          <span className="text-[#777]">{formatPrice(item.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="block">
                    <tr className="flex">
                      <th className={`${ROW_TH} shrink-0`}>סכום ביניים</th>
                      <td className={`${TD} min-w-0 flex-1 text-end`}>
                        <span className="font-semibold text-brand-accent">{formatPrice(cart.subtotal)}</span>
                      </td>
                    </tr>
                    {cart.appliedCoupons.map((c) => (
                      <tr key={c.code} className="flex">
                        <th className={`${ROW_TH} shrink-0`}>קופון: {c.code}</th>
                        <td className={`${TD} min-w-0 flex-1 text-end`}>
                          <span className="text-brand-accent">-{formatPrice(c.discountAmount)}</span>{" "}
                          <button type="button" onClick={() => void removeCoupon(c.code)} className="text-[#333] underline hover:text-brand-accent">
                            [הסרה]
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="flex">
                      <th className={`${ROW_TH} shrink-0`}>משלוח</th>
                      <td className={`${TD} min-w-0 flex-1 text-left`}>
                        {cart.shippingRates.length > 0 ? (
                          <ul className="m-0 list-none p-0">
                            {cart.shippingRates.map((rate) => (
                              <li key={rate.id} className="mb-[5px] last:mb-0">
                                <label className="block cursor-pointer text-left text-[#0c0c0c] max-[767px]:text-[15px] max-[767px]:leading-[21px]">
                                  <input
                                    type="radio"
                                    name="shipping_method"
                                    disabled={shippingUpdating}
                                    checked={cart.chosenShippingMethod === rate.id}
                                    onChange={() => void handleSelectShipping(rate.id)}
                                    className="relative top-[2px] float-left mr-[7px] h-[13px] w-[13px] accent-[#0075ff]"
                                  />
                                  <span className="break-words">
                                    {rate.label}
                                    {Number(rate.cost) > 0 ? ": " : ""}
                                  </span>
                                  {Number(rate.cost) > 0 ? (
                                    <span className="font-semibold text-brand-accent">{formatPrice(rate.cost)}</span>
                                  ) : null}
                                </label>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[#777]">יש לבחור עיר כדי לראות את אפשרויות המשלוח.</span>
                        )}
                      </td>
                    </tr>
                    <tr className="flex">
                      <th className="flex shrink-0 items-center whitespace-nowrap px-[10px] py-[15px] text-start align-middle text-[18px] font-bold leading-[25.2px] text-[#0c0c0c] max-[767px]:px-[3px] max-[767px]:text-[13px] max-[767px]:leading-[18.2px]">
                        סה&quot;כ
                      </th>
                      <td className="min-w-0 flex-1 px-3 py-[15px] text-end align-middle max-[767px]:px-[3px]">
                        <span className="text-[22px] font-semibold text-brand-accent max-[767px]:text-[18px]">
                          {formatPrice(cart.total)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* payment methods (WooCommerce gateways) */}
                <div className="mt-[30px]">
                  {availableGateways.length === 0 ? (
                    <p className="mb-[20px] text-[21px] text-[#777] max-[767px]:text-[13px]">לא נמצאו אמצעי תשלום זמינים.</p>
                  ) : (
                    <ul className="m-0 mb-[20px] list-none p-0">
                      {availableGateways.map((g) => {
                        const selected = activePayment?.id === g.id;
                        return (
                          <li key={g.id} className="mb-[15px]">
                            <label className="flex cursor-pointer flex-wrap items-center gap-[5px] text-[21px] leading-[33.6px] text-[#0c0c0c] max-[767px]:text-[13px] max-[767px]:leading-[20.8px]">
                              <input
                                type="radio"
                                name="payment_method"
                                checked={selected}
                                onChange={() => setPaymentId(g.id)}
                                className={multiGateway ? "h-[13px] w-[13px] accent-[#0075ff]" : "sr-only"}
                              />
                              {g.title}
                              {g.icon ? (
                                <Image src={g.icon} alt="" width={133} height={40} unoptimized className="mx-[5px] h-[40px] w-auto" />
                              ) : null}
                            </label>
                            {selected && g.description ? (
                              <div className="relative mt-[15px] bg-white p-[15px] text-[21px] leading-[33.6px] text-black before:absolute before:-top-[8px] before:start-[20px] before:border-x-[8px] before:border-b-[8px] before:border-x-transparent before:border-b-white">
                                {g.description}
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className={`mb-[20px] border-t ${HAIRLINE} pt-[20px]`}>
                    <label className={TERMS_LABEL}>
                      <input
                        id="terms"
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => {
                          setTerms(e.target.checked);
                          setErrors((prev) => ({ ...prev, terms: undefined }));
                        }}
                        aria-invalid={!!errors.terms || undefined}
                        className={CHECKBOX}
                      />
                      <span>
                        קראתי ואני מסכימ/ה ל
                        <a
                          href="https://www.tamarcosmetics.co.il/terms-and-conditions/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#333] hover:text-brand-accent"
                        >
                          תנאי שימוש
                        </a>{" "}
                        האתר <span className="text-[16px] text-[#e01020]">*</span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || shippingUpdating || !activePayment}
                    className={`${PRIMARY_BTN} h-[48px] w-full px-[28px] text-[14px] font-semibold leading-[16.8px] max-[767px]:text-[23px] max-[767px]:leading-[27.6px]`}
                  >
                    {submitting ? "מבצע הזמנה..." : "לתשלום"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {notice ? (
        <div className="mx-auto max-w-[1600px] px-[25px] pb-[50px] pt-[40px]">
          <p className="text-[19px] font-normal leading-[30px] text-black">{notice}</p>
        </div>
      ) : null}
    </>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-[1115px] animate-pulse px-[25px] pb-[60px] pt-[50px]" aria-busy="true">
      <div className="h-[19px] w-[211px] rounded bg-black/5" />
      <div className="mt-[25px] h-[19px] w-[228px] rounded bg-black/5" />
      <div className="mt-[25px] grid grid-cols-1 gap-[29px] min-[1025px]:grid-cols-2">
        <div>
          <div className="h-[90px] bg-black/5" />
          <div className="mt-[30px] h-[31px] w-[120px] rounded bg-black/5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mt-[20px] h-[42px] rounded-[35px] bg-black/5" />
          ))}
        </div>
        <div className="h-[560px] bg-black/5" />
      </div>
    </div>
  );
}
