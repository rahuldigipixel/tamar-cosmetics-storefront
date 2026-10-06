"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Same source and matching rules as the legacy checkout's Select2 street field (wps-woo-extended):
// data.gov.il streets dataset, searched as "<city> <term>" and filtered to the chosen city.
const DATASET_URL = "https://data.gov.il/api/3/action/datastore_search";
const RESOURCE_ID = "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3";
const DEBOUNCE_MS = 250;

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

interface StreetRecord {
  _id: number;
  שם_רחוב: string;
  שם_ישוב: string;
}

/**
 * Searchable street "select" (pill input + chevron). Disabled until a city is chosen, like the original.
 * The value only changes by picking a result — or the typed text when the lookup service has no answer,
 * so a data.gov.il outage can never block an order.
 */
export function StreetSelect({
  id,
  city,
  value,
  onChange,
  invalid,
  className,
}: {
  id: string;
  city: string;
  value: string;
  onChange: (street: string) => void;
  invalid?: boolean;
  className: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !city) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          resource_id: RESOURCE_ID,
          q: `${city} ${query}`.trim(),
          limit: "100",
        });
        const res = await fetch(`${DATASET_URL}?${params.toString()}`);
        const data = await res.json();
        const cityName = normalize(city);
        const names: string[] = (data?.result?.records ?? [])
          .filter((r: StreetRecord) => normalize(r["שם_ישוב"]) === cityName)
          .map((r: StreetRecord) => normalize(r["שם_רחוב"]));
        if (!cancelled) {
          setResults([...new Set(names)]);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, city, open]);

  function pick(street: string) {
    onChange(street);
    setQuery("");
    setOpen(false);
  }

  const typed = normalize(query);
  const showTyped = typed.length > 0 && !loading && (failed || results.length === 0);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <input
        id={id}
        type="text"
        autoComplete="off"
        disabled={!city}
        aria-invalid={invalid || undefined}
        value={open ? query : value}
        placeholder={city ? "מספר בית ושם רחוב" : "יש לבחור עיר תחילה"}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className={`${className} pl-[40px] disabled:opacity-60`}
      />
      <ChevronDown className="pointer-events-none absolute left-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
      {open && city ? (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-[260px] overflow-auto rounded-[20px] border-2 border-black/10 bg-white py-[6px] text-[14px] leading-[22.4px] shadow-lg"
        >
          {loading ? <li className="px-[15px] py-[6px] text-black/50">מחפש...</li> : null}
          {!loading && results.length === 0 && !showTyped ? (
            <li className="px-[15px] py-[6px] text-black/50">
              {query ? "לא נמצאו התאמות" : "נא להקליד לפחות אות אחת"}
            </li>
          ) : null}
          {results.map((street) => (
            <li key={street}>
              <button
                type="button"
                role="option"
                aria-selected={street === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(street)}
                className="block w-full px-[15px] py-[6px] text-start hover:bg-brand-soft/60"
              >
                {street}
              </button>
            </li>
          ))}
          {showTyped ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(typed)}
                className="block w-full px-[15px] py-[6px] text-start hover:bg-brand-soft/60"
              >
                {typed}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
