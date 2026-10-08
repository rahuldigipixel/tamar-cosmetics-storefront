"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

type Status = "idle" | "loading";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Out-of-stock panel on the single product page: the "המלאי אזל" badge plus the
 * back-in-stock email signup (stored by "Back In Stock Notifier for WooCommerce").
 * Sizes copied from the legacy plugin form (approved exception to the 18px floor, see AGENTS.md).
 */
export function BackInStockForm({ productId }: { productId: number }) {
  const customerEmail = useAuthStore((s) => s.customer?.email);
  // null = untouched, so a logged-in customer's email shows (and survives store hydration) until they edit it.
  const [typed, setTyped] = useState<string | null>(null);
  const email = typed ?? customerEmail ?? "";
  const [status, setStatus] = useState<Status>("idle");
  // Shown under the button (legacy plugin shows its reply there; the form stays visible).
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    if (!EMAIL_RE.test(email.trim())) {
      setMessage({ text: "נא להזין כתובת מייל תקינה", ok: false });
      return;
    }
    setMessage(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean; alreadySubscribed?: boolean; message?: string } | null;
      if (res.ok && data?.success) {
        const fallback = data.alreadySubscribed ? "אימייל זה כבר רשום להתראה על חזרת המוצר למלאי" : "נרשמת בהצלחה, נעדכן אותך במייל כשהמוצר יחזור למלאי";
        setMessage({ text: data.message?.trim() || fallback, ok: !data.alreadySubscribed });
      } else {
        setMessage({ text: "משהו השתבש, נסו שוב מאוחר יותר", ok: false });
      }
    } catch {
      setMessage({ text: "משהו השתבש, נסו שוב מאוחר יותר", ok: false });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mt-[25px]">
      <p className="mb-[20px] w-[156px] bg-[#f3c3cc] text-center text-[21px] leading-[25.2px] font-semibold text-[#333]">המלאי אזל</p>

      <div className="max-w-[520px] overflow-hidden rounded-[4px] border border-[#337ab7] bg-white">
        <h3 className="bg-brand-accent px-[15px] py-[10px] text-center text-[18px] leading-[25.2px] font-bold text-white">
          עדכנו אותי במייל שחוזר למלאי
        </h3>
        <div className="p-[15px]">
          <form onSubmit={handleSubmit} noValidate className="space-y-[30px] pb-[15px]">
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="כתובת מייל לעדכון"
              aria-label="כתובת מייל"
              autoComplete="email"
              className="block h-[42px] w-full rounded-[35px] border-2 border-black/10 bg-white px-[15px] text-center text-[14px] leading-[22.4px] text-[#0c0c0c] outline-none transition-colors placeholder:text-[#999] focus:border-[#337ab7]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex h-[42px] w-full items-center justify-center bg-[#f3f3f3] px-[20px] py-[5px] text-[13px] leading-[15.6px] font-semibold text-[#3e3e3e] transition-colors hover:bg-[#e8e8e8] disabled:opacity-70"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "עדכנו אותי במייל כשהמוצר חוזר"}
            </button>
          </form>
          {message ? (
            <p role={message.ok ? "status" : "alert"} className={`text-center text-[21px] leading-[33.6px] ${message.ok ? "text-[#2e7d32]" : "text-[red]"}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
