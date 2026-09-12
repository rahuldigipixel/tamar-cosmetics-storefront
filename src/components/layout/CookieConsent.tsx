"use client";

import { useEffect, useState } from "react";
import { Cookie, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "tamar-cookie-consent";

interface Consent {
  necessary: true;
  marketing: boolean;
}

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // ignore — worst case the banner reappears next visit
  }
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand-accent" : "bg-black/15"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-[inset-inline-start]"
        style={{ insetInlineStart: checked ? "1.5rem" : "0.25rem" }}
      />
    </button>
  );
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    if (readConsent()) return;
    setMounted(true);
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 300);
  }

  function acceptAll() {
    writeConsent({ necessary: true, marketing: true });
    close();
  }

  function savePreferences() {
    writeConsent({ necessary: true, marketing });
    close();
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:start-6 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      role="dialog"
      aria-label="הגדרות עוגיות"
    >
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl">
        <div className="flex items-start gap-2.5 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-accent">
            <Cookie className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold">אנחנו משתמשים בעוגיות</p>
            <p className="mt-0.5 text-base leading-snug text-black/60">
              כדי לספק את חוויית הגלישה הטובה ביותר אנו משתמשים בעוגיות לשיפור האתר, שיווק והתאמה אישית.
            </p>
          </div>
        </div>

        {showSettings ? (
          <div className="flex flex-col gap-2.5 border-t border-black/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">עוגיות הכרחיות</p>
                <p className="text-base text-black/50">נדרשות לתפקוד תקין של האתר</p>
              </div>
              <Toggle checked disabled />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">עוגיות שיווק ואנליטיקה</p>
                <p className="text-base text-black/50">עוזרות לנו להתאים מבצעים ותוכן עבורך</p>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5 border-t border-black/5 p-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={acceptAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-4 py-2 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] sm:w-auto sm:flex-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            קבל הכל
          </button>
          <button
            type="button"
            onClick={() => (showSettings ? savePreferences() : setShowSettings(true))}
            className="w-full rounded-full border border-black/10 px-4 py-2 text-base font-semibold text-black/70 transition-colors hover:border-brand-accent hover:text-brand-accent sm:w-auto sm:flex-1"
          >
            {showSettings ? "שמור העדפות" : "התאמה אישית"}
          </button>
        </div>
      </div>
    </div>
  );
}
