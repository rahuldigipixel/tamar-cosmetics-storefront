"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCheck } from "lucide-react";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { useAuthStore } from "@/lib/store/useAuthStore";

const subscribeNoop = () => () => {};

// Placeholder history shown for any search until the carrier integration
// exists — newest step first, same order as the reference.
const STATIC_HISTORY: { title: string; date?: string }[] = [
  { title: "ההזמנה נקלטה במערכת" },
  { title: "העמסה איסוף קבוע", date: "2026-09-30 07:57:26" },
  { title: "הוקלד באתר", date: "2026-09-30 07:56:26" },
];

export function ShipmentTracking() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const loggedIn = useAuthStore((s) => !!s.token);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState<string | null>(null);

  if (mounted && !loggedIn) return <LoginPrompt />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) setSearched(query.trim());
  }

  return (
    <AccountLayout>
      <div className="overflow-hidden rounded-xl border border-black/10">
        <div className="bg-brand-soft px-5 py-4 text-[20px] font-bold text-black">
          חפש חבילה בעזרת מספר ההזמנה או מספר השילוח שלך.
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <label htmlFor="shipment-number" className="mb-2 block text-[18px] text-black">
              מספר משלוח
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="shipment-number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-full border border-black/15 bg-white px-4 text-[18px] outline-none focus:border-brand-accent"
              />
              <button type="submit" className={`${AUTH_BUTTON_CLASS} px-8 text-[18px]`}>
                חיפוש
              </button>
            </div>
          </form>

          {searched && (
            <section className="mt-6 rounded-xl border border-black/10 p-6 sm:p-10" aria-live="polite">
              <h2 className="mb-6 text-[22px] font-bold text-black">היסטוריית ההזמנה</h2>
              <ol className="space-y-4">
                {STATIC_HISTORY.map((step) => (
                  <li key={step.title}>
                    <div className="flex items-center gap-3 text-[20px] font-bold text-[#333]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff7a00] text-white">
                        <CheckCheck className="h-4 w-4" />
                      </span>
                      {step.title}
                    </div>
                    {step.date && (
                      <div dir="ltr" className="mt-1 text-end text-[22px] text-black">
                        {step.date}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
