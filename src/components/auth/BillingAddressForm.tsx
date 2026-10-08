"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { AccountField } from "@/components/auth/AccountField";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { IsraelAddressSelect } from "@/components/checkout/IsraelAddressSelect";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAccountData } from "@/lib/utils/useAccountData";
import type { BillingAddress } from "@/lib/wpgraphql/tamarApi";

const COUNTRIES = [{ value: "IL", label: "ישראל" }];

export function BillingAddressForm() {
  const { ready, loggedIn, loading, data } = useAccountData<BillingAddress>("/api/account/billing/");

  if (ready && !loggedIn) return <LoginPrompt />;

  return (
    <AccountLayout>
      <h2 className="mb-4 text-[22px] font-bold text-black">כתובת לחיוב</h2>
      {!ready || loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-full bg-black/5" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-[18px] text-black/70">לא ניתן לטעון את הכתובת כרגע. נסו שוב מאוחר יותר.</p>
      ) : (
        <Form initial={data} />
      )}
    </AccountLayout>
  );
}

function Form({ initial }: { initial: BillingAddress }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState<BillingAddress>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof BillingAddress) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/billing/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "השמירה נכשלה.");
      }
      router.push("/my-account/edit-address");
    } catch (err) {
      setError(err instanceof Error ? err.message : "השמירה נכשלה.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <AccountField
          id="first_name"
          label="שם פרטי"
          required
          autoComplete="given-name"
          value={form.first_name}
          onChange={set("first_name")}
        />
        <AccountField
          id="last_name"
          label="שם משפחה"
          required
          autoComplete="family-name"
          value={form.last_name}
          onChange={set("last_name")}
        />
      </div>
      <AccountField
        id="country"
        label="מדינה / אזור"
        required
        options={COUNTRIES}
        value={form.country}
        onChange={set("country")}
      />
      <div className="grid sm:grid-cols-2">
        <IsraelAddressSelect
          required
          label="עיר"
          value={form.city}
          placeholder="הקלידו שם עיר"
          onChange={({ city }) => set("city")(city)}
        />
      </div>
      <div className="space-y-3">
        <IsraelAddressSelect
          required
          label="כתובת רחוב"
          value={form.address_1}
          placeholder="הקלידו שם רחוב"
          city={form.city || undefined}
          onChange={({ street, city }) => {
            set("address_1")(street);
            if (!form.city) set("city")(city);
          }}
        />
        <AccountField id="address_2" value={form.address_2} onChange={set("address_2")} autoComplete="address-line2" />
      </div>
      <AccountField id="appartment" label="מספר דירה" required value={form.appartment} onChange={set("appartment")} />
      <AccountField
        id="postcode"
        label="מיקוד / תא דואר"
        autoComplete="postal-code"
        value={form.postcode}
        onChange={set("postcode")}
      />
      <AccountField
        id="phone"
        label="טלפון"
        type="tel"
        required
        autoComplete="tel"
        value={form.phone}
        onChange={set("phone")}
      />
      <AccountField
        id="email"
        label="כתובת אימייל"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={set("email")}
      />

      {error && (
        <p className="text-[18px] text-brand-accent" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className={`${AUTH_BUTTON_CLASS} px-8 text-[18px]`}>
        {saving ? "שומר…" : "שמירת כתובת"}
      </button>
    </form>
  );
}
