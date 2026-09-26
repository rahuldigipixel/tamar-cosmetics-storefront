"use client";

import { useState } from "react";
import { Check, Mail, Phone, User } from "lucide-react";

interface FieldProps {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ icon: Icon, type, placeholder, value, onChange }: FieldProps) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-2xl border-1 border-black/40 bg-white px-4 shadow-sm transition-colors focus-within:border-brand-accent focus-within:ring-4 focus-within:ring-brand-accent/10">
      <Icon className="h-5 w-5 shrink-0 text-black" />
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/40"
      />
    </div>
  );
}

export function WholesaleLeadForm({ heading, buttonLabel }: { heading: string; buttonLabel: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/wholesale-lead", {
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

  return (
    <div className="relative w-full max-w-lg rounded-[2rem] border border-black/5 bg-white p-6 shadow-2xl sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-brand-accent/10 blur-2xl"
      />

      {status === "done" ? (
        <div className="relative flex flex-col items-center gap-3 py-8 text-center text-green-800">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Check className="h-7 w-7" />
          </span>
          <p className="text-base font-medium">הפרטים התקבלו בהצלחה! ניצור איתך קשר בהקדם.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
          {heading ? <h3 className="text-xl font-bold">{heading}</h3> : null}
          <Field icon={User} type="text" placeholder="שם מלא *" value={name} onChange={setName} />
          <Field icon={Mail} type="email" placeholder="אימייל *" value={email} onChange={setEmail} />
          <Field icon={Phone} type="tel" placeholder="טלפון *" value={phone} onChange={setPhone} />

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-1 w-full rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(213,32,39,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {status === "loading" ? "שולח..." : buttonLabel || "שליחה"}
          </button>

          {status === "error" ? <p className="text-sm text-brand-accent">משהו השתבש, נסי שוב מאוחר יותר.</p> : null}
        </form>
      )}
    </div>
  );
}
