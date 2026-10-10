"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Cookie, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "tamar-cookie-consent";

interface Consent {
  necessary: true;
  marketing: boolean;
  statistics?: boolean;
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
      className={`relative h-[14px] w-[28px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand-accent" : "bg-black/15"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className="absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-[inset-inline-start]"
        style={{ insetInlineStart: checked ? "16px" : "2px" }}
      />
    </button>
  );
}

function AccordionRow({
  title,
  checked,
  onChange,
  children,
}: {
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-black/[0.03]">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <p className="text-[13px] font-semibold text-black/80">{title}</p>
        <div className="flex items-center gap-3">
          <Toggle checked={checked} onChange={onChange} />
          <button
            type="button"
            aria-expanded={open}
            aria-label={title}
            onClick={() => setOpen((o) => !o)}
            className="text-black/80"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? <p className="px-4 pb-4 text-[12px] leading-snug text-black/70">{children}</p> : null}
    </div>
  );
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [statistics, setStatistics] = useState(true);

  useEffect(() => {
    if (readConsent()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only (no localStorage during SSR)
      setHasConsent(true);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates the client-only render before the entrance transition starts
    setMounted(true);
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    window.setTimeout(() => {
      setMounted(false);
      setHasConsent(true);
    }, 300);
  }

  function reopen() {
    setShowSettings(false);
    setMounted(true);
    window.setTimeout(() => setVisible(true), 20);
  }

  function acceptAll() {
    writeConsent({ necessary: true, marketing: true, statistics: true });
    close();
  }

  function savePreferences() {
    writeConsent({ necessary: true, marketing, statistics });
    close();
  }

  if (!mounted) {
    if (!hasConsent) return null;
    return (
      <button
        type="button"
        onClick={reopen}
        aria-label="ניהול הסכמה"
        className="fixed bottom-1 start-12 z-40 after:absolute after:inset-x-0 after:top-full after:h-1 after:bg-white h-10 translate-y-[calc(100%-8px)] rounded-t-lg bg-white px-4 text-[13px] font-semibold text-black shadow-[0_0_10px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out hover:translate-y-0 focus-visible:translate-y-0"
      >
        ניהול הסכמה
      </button>
    );
  }

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
            <p className="text-[12px] leading-snug text-black/70">
              כדי לספק את חוויות המשתמש הטובות ביותר, אנו משתמשים בטכנולוגיות כמו קבצי Cookie כדי לאחסן ו/או לגשת למידע על המכשיר. הסכמה לטכנולוגיות אלו תאפשר לנו לעבד נתונים כגון התנהגות גלישה או מזהים ייחודיים באתר זה. אי הסכמה או ביטול הסכמה עלולים להשפיע לרעה על תכונות ופונקציות מסוימות.
            </p>
          </div>
        </div>

        {showSettings ? (
          <div className="flex flex-col gap-3 px-4 pb-3">
            <div className="flex items-center justify-between gap-3 bg-black/[0.03] px-4 py-4">
              <p className="text-[13px] font-semibold text-black/80">פונקציונלי</p>
              <span className="text-[12px] font-semibold text-[#008000]">תמיד פעיל</span>
            </div>
            <AccordionRow title="סטטיסטיקות" checked={statistics} onChange={setStatistics}>
              האחסון הטכני או הגישה המשמשים אך ורק למטרות סטטיסטיות.
            </AccordionRow>
            <AccordionRow title="שיווק" checked={marketing} onChange={setMarketing}>
              האחסון הטכני או הגישה נדרשים ליצירת פרופילי משתמשים לשליחת פרסום, או למעקב המשתמש באתר אינטרנט או במספר אתרים למטרות שיווק דומות.
            </AccordionRow>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5 border-t border-black/5 p-3 sm:flex-row">
          <button
            type="button"
            onClick={acceptAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-4 py-2 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] sm:w-auto sm:flex-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            קבל
          </button>
          <button
            type="button"
            onClick={() => (showSettings ? savePreferences() : setShowSettings(true))}
            className="w-full rounded-full border border-black/10 px-4 py-2 text-[15px] font-semibold text-black/70 transition-colors hover:border-brand-accent hover:text-brand-accent sm:w-auto sm:flex-1"
          >
            {showSettings ? "שמר העדפה" : "ראה העדפות"}
          </button>
        </div>
      </div>
    </div>
  );
}
