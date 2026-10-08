"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface FieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ id, type, label, value, onChange }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-white/40 bg-transparent pb-1.5 text-lg text-white outline-none transition-colors focus:border-white"
      />
    </div>
  );
}

interface WholesaleLeadFormProps {
  heading: string;
  checkboxLabel: string;
  buttonLabel: string;
}

export function WholesaleLeadForm({ heading, checkboxLabel, buttonLabel }: WholesaleLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/wholesale-lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      setStatus(data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-3 py-8 text-center text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <Check className="h-7 w-7" />
        </span>
        <p className="text-lg font-medium">הפרטים התקבלו בהצלחה! ניצור איתך קשר בהקדם.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg flex-col gap-5">
      {heading ? <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2> : null}

      <div className="flex flex-col gap-4">
        <Field id="wholesale-name" type="text" label="שם מלא*" value={name} onChange={setName} />
        <Field id="wholesale-email" type="email" label="אימייל*" value={email} onChange={setEmail} />
        <Field id="wholesale-phone" type="tel" label="טלפון*" value={phone} onChange={setPhone} />
      </div>

      {checkboxLabel ? (
        <label className="flex items-start gap-2 text-sm leading-relaxed text-white">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-white"
          />
          {/* Saved from wp-admin as raw HTML — the admin embeds the
              privacy-policy link (or any link) directly in the text, so
              nothing is appended here. */}
          <span className="[&_a]:underline [&_a]:hover:no-underline" dangerouslySetInnerHTML={{ __html: checkboxLabel }} />
        </label>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading" || (Boolean(checkboxLabel) && !agreed)}
        className="w-fit self-start rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-accent shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "loading" ? "שולח..." : buttonLabel}
      </button>

      {status === "error" ? <p className="text-sm text-white">משהו השתבש, נסי שוב מאוחר יותר.</p> : null}
    </form>
  );
}
