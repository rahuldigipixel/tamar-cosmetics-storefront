"use client";

import { useEffect, useRef, useState } from "react";

/**
 * data.gov.il's Israeli streets dataset (resource 9ad3862c-8391-4b2f-84a4-2d4c68625f4b)
 * — free-text search across city ("שם_ישוב") and street ("שם_רחוב") names.
 */
const DATASET_URL = "https://data.gov.il/api/3/action/datastore_search";
const RESOURCE_ID = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b";
const DEBOUNCE_MS = 300;

interface StreetRecord {
  _id: number;
  שם_רחוב: string;
  שם_ישוב: string;
}

export interface IsraelAddressValue {
  street: string;
  city: string;
}

interface IsraelAddressSelectProps {
  label: string;
  value: string;
  onChange: (value: IsraelAddressValue) => void;
  placeholder?: string;
  /** Restrict street suggestions to this city, if already selected. */
  city?: string;
  required?: boolean;
}

export function IsraelAddressSelect({ label, value, onChange, placeholder, city, required }: IsraelAddressSelectProps) {
  const [query, setQuery] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [results, setResults] = useState<StreetRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the parent resets `value` (e.g. clearing the
  // form) without a setState-in-effect cascade: adjust during render instead.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setQuery(value);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          resource_id: RESOURCE_ID,
          q: query.trim(),
          limit: "10",
        });
        if (city) {
          params.set("filters", JSON.stringify({ שם_ישוב: city }));
        }
        const res = await fetch(`${DATASET_URL}?${params.toString()}`);
        const data = await res.json();
        setResults(data?.result?.records ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, city]);

  return (
    <div className="relative text-right">
      <span className="mb-1 block text-base font-medium text-black/70">
        {label}
        {required ? <span className="text-brand-accent"> *</span> : null}
      </span>
      <input
        value={query}
        placeholder={placeholder}
        required={required}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-accent"
        autoComplete="off"
      />
      {open && (loading || results.length > 0) ? (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
          {loading ? <li className="px-4 py-2.5 text-base text-black/40">מחפש...</li> : null}
          {results.map((record) => (
            <li key={record._id}>
              <button
                type="button"
                onMouseDown={() => {
                  setQuery(record.שם_רחוב);
                  onChange({ street: record.שם_רחוב, city: record.שם_ישוב });
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-right text-base hover:bg-brand-soft/40"
              >
                {record.שם_רחוב} <span className="text-black/40">— {record.שם_ישוב}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
