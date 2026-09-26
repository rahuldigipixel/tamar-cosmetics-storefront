"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { IsraelAddressSelect } from "@/components/checkout/IsraelAddressSelect";
import type { IsraeliAddress } from "@/app/api/checkout/route";

const EMPTY_ADDRESS: IsraeliAddress = {
  first_name: "",
  address_1: "",
  appartment: "",
  city: "",
  country: "IL",
  email: "",
  phone: "",
};

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-right">
      <span className="mb-1 block text-base font-medium text-black/70">
        {label}
        {props.required ? <span className="text-brand-accent"> *</span> : null}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-accent"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const sessionToken = useCartStore((s) => s.sessionToken);
  const [address, setAddress] = useState<IsraeliAddress>(EMPTY_ADDRESS);
  const paymentMethod = "gocredit" as const;
  const [orderNote, setOrderNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof IsraeliAddress>(field: K, fieldValue: IsraeliAddress[K]) {
    setAddress((prev) => ({ ...prev, [field]: fieldValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!address.appartment.trim()) {
      setError("מספר דירה הינו שדה חובה");
      return;
    }
    if (!acceptedTerms) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
      return;
    }

    setSubmitting(true);
    setError(null);
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
          payment_method: paymentMethod,
          customer_note: orderNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה בביצוע ההזמנה");

      if (data.payment_result?.redirect_url) {
        // GoCredit hosted-page redirect flow.
        window.location.href = data.payment_result.redirect_url;
      } else {
        router.push(`/checkout/success?order=${data.order_id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-[15px] py-20 text-center ">
        <h1 className="text-2xl font-bold">אין מוצרים לתשלום</h1>
        <p className="mt-2 text-base text-black/50">העגלה שלך ריקה.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-8 py-3 text-base font-semibold text-white"
        >
          המשך בקניות
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-[15px] py-8 ">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">תשלום</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
        <form onSubmit={handleSubmit} id="checkout-form" className="space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="mb-3 text-xl font-bold">פרטי משלוח וחיוב</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                required
                label="שם מלא או שם חברה"
                value={address.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
              />
              <Field
                required
                type="email"
                label="דוא&quot;ל"
                value={address.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <Field
                required
                label="טלפון"
                value={address.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <div className="sm:col-span-2">
                <IsraelAddressSelect
                  required
                  label="עיר"
                  value={address.city}
                  placeholder="הקלידו שם עיר"
                  onChange={({ city }) => updateField("city", city)}
                />
              </div>
              <IsraelAddressSelect
                required
                label="רחוב"
                value={address.address_1}
                placeholder="הקלידו שם רחוב"
                city={address.city || undefined}
                onChange={({ street, city }) => {
                  updateField("address_1", street);
                  if (!address.city) updateField("city", city);
                }}
              />
              <Field
                required
                label="מספר דירה"
                value={address.appartment}
                onChange={(e) => updateField("appartment", e.target.value)}
              />
            </div>

            <label className="mt-3 block text-right">
              <span className="mb-1 block text-base font-medium text-black/70">הערות להזמנה (אופציונלי)</span>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={3}
                placeholder="הערות מיוחדות לגבי ההזמנה, למשל הוראות למשלוח"
                className="w-full resize-none rounded-xl border border-black/10 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-accent"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="mb-3 text-xl font-bold">אמצעי תשלום</h2>
            <div className="flex cursor-default items-center gap-3 rounded-xl border border-brand-accent bg-brand-soft/40 p-3.5">
              <input type="radio" checked readOnly className="h-4 w-4 accent-brand-accent" />
              <CreditCard className="h-5 w-5 text-black/60" />
              <span className="text-base font-medium">כרטיס אשראי (GoCredit)</span>
            </div>
          </div>

          {error ? <p className="text-base text-red-600">{error}</p> : null}
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="text-xl font-bold">סיכום הזמנה</h2>

          <ul className="divide-y divide-black/5">
            {cart.items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-soft/30">
                  {item.product.image ? (
                    <Image
                      src={item.product.image.src}
                      alt={item.product.image.alt || item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                  <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <span className="min-w-0 flex-1 text-base leading-snug">
                  {item.product.name}
                  <span className="text-black/50"> &times; {item.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-black/5 pt-4 text-base">
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
            ) : (
              <div className="flex justify-between text-brand-accent">
                <span>משלוח</span>
                <span>חינם</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-black/5 pt-4 text-xl font-bold">
            <span>סה&quot;כ לתשלום</span>
            <span className="text-brand-accent">{formatPrice(cart.total)}</span>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-base leading-relaxed text-black/60">
            <input
              type="checkbox"
              form="checkout-form"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-accent"
            />
            <span>
              קראתי ואני מסכימ/ה ל{" "}
              <a
                href="https://www.tamarcosmetics.co.il/terms-and-conditions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-accent underline hover:no-underline"
              >
                תנאי השימוש ומדיניות הפרטיות
              </a>{" "}
              של האתר
              <span className="text-brand-accent"> *</span>
            </span>
          </label>

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting || !acceptedTerms}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "מבצע הזמנה..." : "בצע הזמנה"}
          </button>
        </aside>
      </div>
    </div>
  );
}
