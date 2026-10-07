"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

// Select2-style dropdown (as on the legacy WooCommerce cart/checkout): a pill that shows the chosen option,
// opening a panel with a search box on top and a scrollable list below. The active row is highlighted in the
// brand colour; ↑/↓ move it, Enter picks, Esc closes. Matching is "contains", like Select2.
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "בחר אפשרות…",
  disabled,
  invalid,
  placeholderClassName = "text-black/60",
  className,
}: {
  id: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholderClassName?: string;
  /** Classes for the closed pill (size, border, font) — the panel is styled here. */
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    return q ? options.filter((o) => o.label.includes(q)) : options;
  }, [options, query]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  // Keep the highlighted row visible while arrowing through ~1,300 entries.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openMenu() {
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function pick(option: SelectOption | undefined) {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`${className} block truncate pl-[40px] text-right disabled:opacity-60`}
      >
        {selectedLabel ?? <span className={placeholderClassName}>{placeholder}</span>}
      </button>
      <ChevronDown
        className={`pointer-events-none absolute left-[15px] top-[21px] h-4 w-4 -translate-y-1/2 text-black/50 transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />
      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[20px] text-right border-2 border-black/10 bg-white shadow-lg">
          <div className="relative p-[10px]">
            <input
              ref={inputRef}
              type="text"
              role="searchbox"
              autoComplete="off"
              aria-label="חיפוש"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={handleKeyDown}
              className="h-[36px] w-full rounded-[35px] border-2 border-black/10 bg-transparent pl-[12px] pr-[36px] text-[14px] leading-[22.4px] text-black outline-none focus:border-brand-accent"
            />
            <Search className="pointer-events-none absolute right-[22px] top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
          </div>
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            // Keep the search input focused when the scrollbar / a row is pressed.
            onMouseDown={(e) => e.preventDefault()}
            className="max-h-[220px] overflow-y-auto border-t border-black/10 text-[14px] leading-[22.4px]"
          >
            {filtered.length === 0 ? <li className="px-[15px] py-[8px] text-black/50">לא נמצאו התאמות</li> : null}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                data-idx={i}
                aria-selected={o.value === value}
                onClick={() => pick(o)}
                onMouseMove={() => active !== i && setActive(i)}
                className={`cursor-pointer px-[15px] py-[8px] ${
                  i === active ? "bg-brand-accent text-white" : o.value === value ? "bg-black/[0.06]" : ""
                }`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
