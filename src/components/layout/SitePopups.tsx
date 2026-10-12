"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { RichContent } from "@/components/ui/RichContent";
import type { AgeVerifyConfig, PromoPopupConfig } from "@/lib/wpgraphql/tamarApi";

// Same cookie names/lifetimes as the legacy WoodMart popups (js/scripts/global/ageVerify.js, promoPopup.js).
const AGE_COOKIE = "tamar_age_verify";
const AGE_COOKIE_DAYS = 30;
const PROMO_COOKIE_PREFIX = "tamar_promo_popup_";
const PROMO_COOKIE_DAYS = 7;
const MOBILE_MAX_WIDTH = 768;

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax${secure}`;
}

const BTN_PRIMARY =
  "rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-2.5 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]";
const BTN_SECONDARY =
  "rounded-full border border-black/15 bg-white px-6 py-2.5 text-lg font-semibold text-black/70 transition-colors hover:border-brand-accent hover:text-brand-accent";

function Overlay({ children, onBackdrop, label }: { children: React.ReactNode; onBackdrop?: () => void; label: string }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdrop?.();
      }}
    >
      {children}
    </div>
  );
}

// dir="auto": admin copy may be English or Hebrew; each block lays out in its own language's direction.
function PopupText({ title, html }: { title: string; html: string }) {
  return (
    <>
      {title ? (
        <h2 dir="auto" className="mb-4 text-3xl font-bold leading-tight text-black">
          {title}
        </h2>
      ) : null}
      <div dir="auto">
        <RichContent html={html} className="text-center" />
      </div>
    </>
  );
}

/**
 * Site-wide popups configured in wp-admin → General Site Settings (delivered in /global-data):
 *  - age verify: blocking dialog until "18 or older" is clicked (cookie, 30 days); "under 18" swaps in the error message.
 *  - promo: opens after `delay` ms, once per `version` (cookie, 7 days), never before the age gate is confirmed,
 *    optionally not on mobile. Same behaviour as the legacy WoodMart popups.
 * Rendered client-side only (cookies), after hydration — the root layout stays statically cacheable.
 */
export function SitePopups({ promo, ageVerify }: { promo: PromoPopupConfig | null; ageVerify: AgeVerifyConfig | null }) {
  // null until the cookie has been read on the client.
  const [ageConfirmed, setAgeConfirmed] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only (no cookies during SSR)
    setAgeConfirmed(!ageVerify || readCookie(AGE_COOKIE) === "confirmed");
  }, [ageVerify]);

  useEffect(() => {
    if (!promo || !ageConfirmed) return;
    if (promo.hideOnMobile && window.innerWidth < MOBILE_MAX_WIDTH) return;
    if (readCookie(PROMO_COOKIE_PREFIX + promo.version) === "shown") return;
    const timer = window.setTimeout(() => setPromoOpen(true), promo.delay);
    return () => window.clearTimeout(timer);
  }, [promo, ageConfirmed]);

  const ageOpen = ageVerify !== null && ageConfirmed === false;
  const open = ageOpen || promoOpen;

  function closePromo() {
    setPromoOpen(false);
    if (promo) writeCookie(PROMO_COOKIE_PREFIX + promo.version, "shown", PROMO_COOKIE_DAYS);
  }

  // Lock page scroll while a popup is open; Esc closes the promo (never the age gate, like WoodMart).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ageOpen && promo) {
        setPromoOpen(false);
        writeCookie(PROMO_COOKIE_PREFIX + promo.version, "shown", PROMO_COOKIE_DAYS);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ageOpen, promo]);

  if (ageOpen && ageVerify) {
    return (
      <Overlay label={ageVerify.title || "Age verification"}>
        <div className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-lg bg-white p-8 text-center shadow-2xl">
          {denied ? (
            <PopupText title={ageVerify.errorTitle} html={ageVerify.errorText} />
          ) : (
            <>
              <PopupText title={ageVerify.title} html={ageVerify.text} />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {ageVerify.denyLabel ? (
                  <button type="button" onClick={() => setDenied(true)} className={BTN_SECONDARY}>
                    {ageVerify.denyLabel}
                  </button>
                ) : null}
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    writeCookie(AGE_COOKIE, "confirmed", AGE_COOKIE_DAYS);
                    setAgeConfirmed(true);
                  }}
                  className={BTN_PRIMARY}
                >
                  {ageVerify.allowLabel || "OK"}
                </button>
              </div>
            </>
          )}
        </div>
      </Overlay>
    );
  }

  if (promoOpen && promo) {
    return (
      <Overlay label={promo.title || "Promo"} onBackdrop={closePromo}>
        <div className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-lg bg-white p-8 text-center shadow-2xl">
          <button
            type="button"
            onClick={closePromo}
            aria-label="סגירה"
            className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X className="h-6 w-6" />
          </button>
          <PopupText title={promo.title} html={promo.content} />
        </div>
      </Overlay>
    );
  }

  return null;
}
