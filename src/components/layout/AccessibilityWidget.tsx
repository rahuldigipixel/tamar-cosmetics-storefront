"use client";

import { useEffect, useState } from "react";
import {
  Accessibility,
  Contrast,
  Link2,
  MousePointer2,
  RotateCcw,
  Type,
  X,
} from "lucide-react";

const STORAGE_KEY = "a11yPrefs";
const FONT_SCALE_STEPS = [100, 110, 125, 150];

interface Prefs {
  fontScaleIndex: number;
  grayscale: boolean;
  contrast: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  largeCursor: boolean;
}

const DEFAULT_PREFS: Prefs = {
  fontScaleIndex: 0,
  grayscale: false,
  contrast: false,
  underlineLinks: false,
  readableFont: false,
  largeCursor: false,
};

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.style.fontSize = `${FONT_SCALE_STEPS[prefs.fontScaleIndex]}%`;
  root.classList.toggle("a11y-grayscale", prefs.grayscale);
  root.classList.toggle("a11y-contrast", prefs.contrast);
  root.classList.toggle("a11y-underline-links", prefs.underlineLinks);
  root.classList.toggle("a11y-readable-font", prefs.readableFont);
  root.classList.toggle("a11y-large-cursor", prefs.largeCursor);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...DEFAULT_PREFS, ...JSON.parse(saved) } as Prefs;
        setPrefs(parsed);
        applyPrefs(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyPrefs(prefs);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs, hydrated]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggle<K extends keyof Prefs>(key: K) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function cycleFontScale() {
    setPrefs((p) => ({ ...p, fontScaleIndex: (p.fontScaleIndex + 1) % FONT_SCALE_STEPS.length }));
  }

  function reset() {
    setPrefs(DEFAULT_PREFS);
  }

  const toggles: {
    key: keyof Prefs;
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    valueLabel?: string;
  }[] = [
    {
      key: "fontScaleIndex",
      icon: Type,
      label: "גודל טקסט",
      active: prefs.fontScaleIndex > 0,
      onClick: cycleFontScale,
      valueLabel: `${FONT_SCALE_STEPS[prefs.fontScaleIndex]}%`,
    },
    { key: "contrast", icon: Contrast, label: "ניגודיות גבוהה", active: prefs.contrast, onClick: () => toggle("contrast") },
    { key: "grayscale", icon: Accessibility, label: "גווני אפור", active: prefs.grayscale, onClick: () => toggle("grayscale") },
    { key: "underlineLinks", icon: Link2, label: "הדגשת קישורים", active: prefs.underlineLinks, onClick: () => toggle("underlineLinks") },
    { key: "readableFont", icon: Type, label: "גופן קריא", active: prefs.readableFont, onClick: () => toggle("readableFont") },
    { key: "largeCursor", icon: MousePointer2, label: "סמן גדול", active: prefs.largeCursor, onClick: () => toggle("largeCursor") },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="כלי נגישות"
        className="fixed bottom-[76px] left-5 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform duration-300 hover:scale-110 sm:bottom-[84px] sm:left-6"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      <div
        className={`fixed inset-0 z-[110] bg-black/20 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="כלי נגישות"
        className={`fixed inset-x-0 bottom-0 z-[120] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-3xl px-3 pb-4">
          <div className="rounded-2xl bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-2">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Accessibility className="h-4 w-4" />
                כלי נגישות
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="סגירה"
                className="rounded-full p-1 text-black/60 hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 overflow-x-auto p-2.5">
              {toggles.map(({ key, icon: Icon, label, active, onClick, valueLabel }) => (
                <button
                  key={key}
                  type="button"
                  onClick={onClick}
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors ${
                    active ? "border-brand-accent bg-brand-soft/50 text-brand-accent" : "border-black/10 text-black/70 hover:border-black/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                  {valueLabel ? <span className="text-[9px] font-semibold">{valueLabel}</span> : null}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={reset}
              className="flex w-full items-center justify-center gap-1.5 border-t border-black/5 py-2 text-xs font-semibold text-black/60 hover:bg-black/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              איפוס הגדרות
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
