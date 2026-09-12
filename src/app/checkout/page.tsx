"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
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

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const sessionToken = useCartStore((s) => s.sessionToken);
  const [address, setAddress] = useState<IsraeliAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<"gocredit" | "paypal">("gocredit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof IsraeliAddress>(field: K, fieldValue: IsraeliAddress[K]) {
    setAddress((prev) => ({ ...prev, [field]: fieldValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!address.appartment.trim()) {
      setError("מספר דירה הינו שדה חובה");
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">תשלום</h1>

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <input
          required
          placeholder="שם מלא או שם חברה על גבי חשבונית"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={address.first_name}
          onChange={(e) => updateField("first_name", e.target.value)}
        />
        <input
          required
          placeholder="דוא&quot;ל"
          type="email"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={address.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
        <input
          required
          placeholder="טלפון"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={address.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <IsraelAddressSelect
          label="עיר"
          value={address.city}
          placeholder="הקלידו שם עיר"
          onChange={({ city }) => updateField("city", city)}
        />
        <IsraelAddressSelect
          label="רחוב"
          value={address.address_1}
          placeholder="הקלידו שם רחוב"
          city={address.city || undefined}
          onChange={({ street, city }) => {
            updateField("address_1", street);
            if (!address.city) updateField("city", city);
          }}
        />

        <input
          required
          placeholder="מספר דירה"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={address.appartment}
          onChange={(e) => updateField("appartment", e.target.value)}
        />

        <fieldset className="rounded border border-black/10 p-4">
          <legend className="px-1 text-sm font-medium">אמצעי תשלום</legend>
          <label className="flex items-center gap-2 py-1">
            <input
              type="radio"
              checked={paymentMethod === "gocredit"}
              onChange={() => setPaymentMethod("gocredit")}
            />
            כרטיס אשראי (GoCredit)
          </label>
          <label className="flex items-center gap-2 py-1">
            <input type="radio" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
            PayPal
          </label>
        </fieldset>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || cart.items.length === 0}
          className="w-full rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-accent disabled:opacity-60"
        >
          {submitting ? "מבצע הזמנה..." : "בצע הזמנה"}
        </button>
      </form>
    </div>
  );
}
