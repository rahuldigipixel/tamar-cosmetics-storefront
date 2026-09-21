"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption<T extends string> {
  value: T;
  label: string;
  /** Shown as a small thumb before the label (trigger + option row) — e.g. a brand logo. */
  image?: string;
}

/**
 * Native <select> dropdowns render via the OS/browser's own popup layer —
 * flipping open upward when there isn't room below (as happened inside this
 * sticky filter sidebar) and impossible to restyle. This renders the options
 * list ourselves, portaled to <body> with fixed positioning so it always
 * opens downward from the trigger and isn't clipped by an `overflow-y-auto`
 * ancestor (the filter sidebar scrolls internally) the way an in-flow
 * absolutely-positioned panel would be.
 */
export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => setMounted(true), []);

  function updateRect() {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 8, left: r.left, width: r.width });
  }

  function toggleOpen() {
    if (!open) updateRect();
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    updateRect();
    function onClickOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      document.removeEventListener("mousedown", onClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2.5 text-base font-medium outline-none transition-colors hover:border-black/20 focus:border-brand-accent focus:bg-white"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.image ? (
            <Image src={selected.image} alt="" width={20} height={20} className="h-5 w-5 shrink-0 rounded object-contain" />
          ) : null}
          <span className="truncate">{selected?.label ?? ""}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-black/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && rect
        ? createPortal(
            <ul
              ref={panelRef}
              role="listbox"
              style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
              className={`z-[100] max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] transition-all duration-150 ${
                open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0 pointer-events-none"
              }`}
            >
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-base transition-colors ${
                      opt.value === value
                        ? "bg-brand-soft font-semibold text-brand-accent"
                        : "text-black/75 hover:bg-black/5"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {opt.image ? (
                        <Image src={opt.image} alt="" width={20} height={20} className="h-5 w-5 shrink-0 rounded object-contain" />
                      ) : null}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {opt.value === value ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                </li>
              ))}
            </ul>,
            document.body
          )
        : null}
    </div>
  );
}
