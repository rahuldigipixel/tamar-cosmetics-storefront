"use client";

import Link from "next/link";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useAccountData } from "@/lib/utils/useAccountData";
import type { BillingAddress } from "@/lib/wpgraphql/tamarApi";

export function AddressOverview() {
  const { ready, loggedIn, loading, data } = useAccountData<BillingAddress>("/api/account/billing");

  if (ready && !loggedIn) return <LoginPrompt />;

  const lines = data
    ? [
        `${data.first_name} ${data.last_name}`.trim(),
        data.address_1,
        data.address_2,
        data.appartment,
        data.city,
        data.postcode,
      ].filter(Boolean)
    : [];

  return (
    <AccountLayout>
      <p className="text-[20px] leading-[32px] text-black">הכתובות הנ&quot;ל תשמשו כברירת מחדל במהלך התשלום.</p>
      <h2 className="mb-3 mt-6 text-[22px] font-bold text-black">כתובת לחיוב</h2>
      {!ready || loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-7 w-48 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      ) : (
        <>
          <Link
            href="/my-account/edit-address/billing"
            className="text-[18px] font-semibold text-brand-accent hover:underline"
          >
            ערוך כתובת לחיוב
          </Link>
          <address className="mt-4 text-[20px] italic leading-[40px] text-black">
            {lines.length ? (
              lines.map((l, i) => <div key={i}>{l}</div>)
            ) : (
              <span className="not-italic text-black/60">עדיין לא הוגדרה כתובת.</span>
            )}
          </address>
        </>
      )}
    </AccountLayout>
  );
}
