"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PRIMARY_BTN } from "@/components/cart/cartStyles";

interface City {
  code: string;
  name: string;
}

// Measured from the original calculator: 42px pill selects with a 2px hairline border, 14px text,
// 12px labels (5px gap), 20px between fields, 36px "עדכן" button.
const SELECT =
  "h-[42px] w-full appearance-none rounded-[35px] border-2 border-black/10 bg-transparent px-[15px] text-[14px] leading-[38px] text-black outline-none transition-colors focus:border-brand-accent disabled:opacity-60";
const LABEL = "mb-[5px] block text-left text-[12px] leading-[16.8px] text-[#0c0c0c]";

// The legacy cart's "חישוב המשלוח" calculator: Israel + city. The chosen city goes to WooCommerce as the
// shipping state so its shipping zones (e.g. Jerusalem pickup / same-day) decide which methods are offered.
// The ~1,300-city list is fetched only when the picker opens, never on page load.
export function ShippingAddressPicker({
  currentState,
  onSubmit,
  onDone,
}: {
  currentState?: string;
  onSubmit: (state: string, city: string) => Promise<void>;
  onDone: () => void;
}) {
  const [cities, setCities] = useState<City[] | null>(null);
  const [selected, setSelected] = useState(currentState ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shipping-cities")
      .then((res) => res.json())
      .then((data: City[]) => {
        if (!cancelled) setCities(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const city = cities?.find((c) => c.code === selected);
    if (!city) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(city.code, city.name);
      onDone();
    } catch {
      setError("לא ניתן לעדכן את הכתובת, נסו שוב.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="-mb-[10px] mt-[20px] text-left">
      <div className="mb-[20px]">
        <label htmlFor="cart-ship-country" className={LABEL}>
          מדינה / אזור&nbsp;<span className="text-brand-accent">*</span>
        </label>
        <div className="relative">
          <select id="cart-ship-country" className={SELECT} defaultValue="IL">
            <option value="IL">ישראל</option>
          </select>
          <ChevronDown className="pointer-events-none absolute left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
        </div>
      </div>
      <div className="mb-[20px]">
        <label htmlFor="cart-ship-city" className={LABEL}>
          עיר&nbsp;<span className="text-brand-accent">*</span>
        </label>
        <div className="relative">
          <select
            id="cart-ship-city"
            className={SELECT}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={cities === null || saving}
          >
            <option value="">{cities === null ? "טוען…" : "בחר אפשרות…"}</option>
            {(cities ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
        </div>
      </div>
      {error ? <p className="mb-[10px] text-brand-accent">{error}</p> : null}
      <button
        type="submit"
        disabled={!selected || saving}
        className={`${PRIMARY_BTN} h-[36px] px-[14px] py-[5px] text-[12px] font-semibold leading-[14.4px]`}
      >
        {saving ? "מעדכן..." : "עדכן"}
      </button>
    </form>
  );
}
