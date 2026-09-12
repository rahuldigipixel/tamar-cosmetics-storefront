"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Copy, Check } from "lucide-react";

const OPEN_DELAY_MS = 3000;
const COUPON = "GET15";
const SHOWN_KEY = "welcomePopupShown";
const HEARTBEAT_KEY = "welcomePopupHeartbeat";
const HEARTBEAT_INTERVAL_MS = 2000;
// If no tab has updated the heartbeat more recently than this, the browser
// was actually closed (not just this tab refreshed or a new tab opened)
// since the last time any tab was open — so the popup is due again.
const HEARTBEAT_STALE_MS = 5000;

export function WelcomePopup() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // sessionStorage is per-tab, not per-browser-session — a plain new tab
    // (not a duplicated one) starts with empty storage, so it would re-show
    // the popup even though the browser never actually closed. A shared
    // localStorage heartbeat, updated by whichever tab is open, lets us tell
    // "browser was actually closed" apart from "just refreshed/new tab."
    let heartbeatInterval: number | undefined;
    let timer: number | undefined;

    try {
      const lastHeartbeat = Number(window.localStorage.getItem(HEARTBEAT_KEY) ?? "0");
      if (Date.now() - lastHeartbeat > HEARTBEAT_STALE_MS) {
        window.localStorage.removeItem(SHOWN_KEY);
      }

      const beat = () => {
        try {
          window.localStorage.setItem(HEARTBEAT_KEY, String(Date.now()));
        } catch {
          // ignore
        }
      };
      beat();
      heartbeatInterval = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);

      if (window.localStorage.getItem(SHOWN_KEY)) {
        return () => {
          if (heartbeatInterval) window.clearInterval(heartbeatInterval);
        };
      }
    } catch {
      // localStorage unavailable — fall back to showing every time
    }

    timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(SHOWN_KEY, "1");
      } catch {
        // ignore — worst case the popup shows again next navigation
      }
      setMounted(true);
      // Two nested rAFs: the first lets the browser paint the just-mounted
      // node in its opacity-0/scale-95 starting state, the second then
      // flips it to visible — otherwise both class changes can land in the
      // same paint and the transition never gets a "from" frame to animate
      // from, so it just snaps in instead of fading/scaling smoothly.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (heartbeatInterval) window.clearInterval(heartbeatInterval);
    };
  }, []);

  function close() {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 500);
  }

  async function copyCoupon() {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — coupon is still visible to copy manually
    }
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="מבצע מיוחד"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl transition-all duration-500 ease-out ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-accent to-[#ff6b72] px-6 pb-8 pt-10 text-center text-white">
          <div aria-hidden className="pointer-events-none absolute -top-10 -start-10 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-14 -end-14 h-44 w-44 animate-pulse rounded-full bg-white/10 blur-2xl" />

          <button
            type="button"
            onClick={close}
            aria-label="סגור"
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="mx-auto flex w-fit animate-bounce items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-base font-semibold">
            <Sparkles className="h-4 w-4" />
            מבצע לזמן מוגבל
          </span>

          <h2 className="relative mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">זה הזמן להתחדש לחג!</h2>
          <p className="relative mt-2 text-xl font-semibold sm:text-2xl">
            עד 60% הנחה <span className="opacity-90">+</span> 15% הנחה נוספים
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-7 text-center">
          <button
            type="button"
            onClick={copyCoupon}
            aria-label="העתק קופון"
            className="flex w-full max-w-xs items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-brand-accent/40 bg-brand-soft/40 px-5 py-3.5"
          >
            <span className="text-lg font-semibold text-black/60">קופון:</span>
            <span className="flex items-center gap-2 text-2xl font-extrabold tracking-widest text-brand-accent">
              {COUPON}
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </span>
          </button>
          {copied ? <p className="-mt-2 text-base font-medium text-brand-accent">הקופון הועתק!</p> : null}

          <p className="max-w-xs text-base leading-relaxed text-black/45">
            *על מוצרים נבחרים | ט.ל.ח | כפוף לתקנון | ללא כפל מבצעים
          </p>

          <button
            type="button"
            onClick={close}
            className="mt-1 w-full max-w-xs rounded-full bg-black px-6 py-3.5 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            לרכישה עכשיו
          </button>
        </div>
      </div>
    </div>
  );
}
