"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AccountFieldProps {
  id: string;
  label?: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  /** When set, renders a <select> with these options instead of an input. */
  options?: { value: string; label: string }[];
}

const CONTROL =
  "h-11 w-full rounded-full border border-black/15 bg-white px-4 text-[18px] outline-none focus:border-brand-accent";

/** Rounded pill field shared by the account forms (billing address, profile). */
export function AccountField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  hint,
  options,
}: AccountFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[18px] leading-[28px] text-black">
          {label} {required ? <span className="text-brand-accent">*</span> : null}
        </label>
      )}
      {options ? (
        <select id={id} value={value} required={required} onChange={(e) => onChange(e.target.value)} className={CONTROL}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : type === "password" ? (
        <div className="flex h-11 items-center overflow-hidden rounded-full border border-black/15 focus-within:border-brand-accent">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
            className="flex h-full w-11 shrink-0 items-center justify-center bg-black/5 text-black/50"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 text-[18px] outline-none"
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={CONTROL}
        />
      )}
      {hint && <em className="text-[18px] text-black">{hint}</em>}
    </div>
  );
}
