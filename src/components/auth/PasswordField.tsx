"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}

export function PasswordField({ id, name, label, value, onChange, autoComplete, required }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[16px] leading-[26px] font-normal text-black">
        {label} {required ? <span className="text-brand-accent">*</span> : null}
      </label>
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
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 text-[16px] outline-none"
        />
      </div>
    </div>
  );
}
