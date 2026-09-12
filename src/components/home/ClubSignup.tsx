"use client";

import { useState } from "react";
import Image from "next/image";
import { Cake, Check, Gift, Mail, Percent, Phone, Sparkles, User, Zap } from "lucide-react";

interface FieldProps {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

function Field({ icon: Icon, type, placeholder, required, value, onChange }: FieldProps) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-2xl border-1 border-black/40 bg-white px-4 shadow-sm transition-colors focus-within:border-brand-accent focus-within:ring-4 focus-within:ring-brand-accent/10">
      <Icon className="h-5 w-5 shrink-0 text-black" />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/40 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 ${
          type === "date" ? "cursor-pointer" : ""
        }`}
      />
    </div>
  );
}

const PERKS = [
  { icon: Gift, label: "מתנת יום הולדת" },
  { icon: Percent, label: "מבצעים בלעדיים" },
  { icon: Zap, label: "עדכון ראשונים" },
  { icon: Sparkles, label: "הטבות VIP" },
];

export function ClubSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, birthday }),
      });
      const data = await res.json();
      setStatus(data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-white bg-cover bg-center py-10 my-6 sm:py-[80px] sm:my-[50px]"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(255,255,255,0.92), rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.92)), url('/את-הנבחרת-הסודית-שלנו-את-הכרת.webp')",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -start-24 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1400px] items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* Info side */}
        <div className="flex flex-col gap-4 text-center lg:text-right">
          <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-accent shadow-sm lg:mx-0">
            <Sparkles className="h-4 w-4" />
            מועדון לקוחות VIP
          </span>

          <h2 className="text-xl font-bold leading-[1.15] sm:whitespace-nowrap sm:text-3xl lg:text-4xl">
            את המועדון הסודי שלנו <span className="text-brand-accent">כבר הכרת?</span>
          </h2>

          <p className="mx-auto max-w-lg text-base text-black/60 sm:text-lg lg:mx-0">
            עולם שלם של הנחות ומבצעים סודיים, רק בשבילך. חברות המועדון הסודי מקבלות הרבה יותר.
          </p>

          <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0">
            {PERKS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-black/70">{label}</span>
              </div>
            ))}
          </div>

          <div className="relative mx-auto hidden h-48 w-full max-w-lg overflow-hidden rounded-3xl shadow-lg lg:mx-0 lg:block">
            <Image src="/banner1.jpg" alt="מועדון הלקוחות של תמר קוסמטיקס" fill sizes="40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
          </div>
        </div>

        {/* Form side — floating card */}
        <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-black/5 bg-white p-6 shadow-2xl sm:p-8 lg:mx-0">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-brand-accent/10 blur-2xl"
          />

          {status === "done" ? (
            <div className="relative flex flex-col items-center gap-3 py-8 text-center text-green-800">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <Check className="h-7 w-7" />
              </span>
              <p className="text-base font-medium">נרשמת בהצלחה! ברוכה הבאה למועדון הלקוחות של תמר קוסמטיקס.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
              <h3 className="text-xl font-bold">הצטרפי עכשיו, בחינם</h3>
              <Field icon={User} type="text" placeholder="שם מלא *" required value={name} onChange={setName} />
              <Field icon={Mail} type="email" placeholder="אימייל *" required value={email} onChange={setEmail} />
              <Field icon={Phone} type="tel" placeholder="טלפון *" required value={phone} onChange={setPhone} />
              <Field
                icon={Cake}
                type="date"
                placeholder="תאריך לידה לקבלת הטבת יום הולדת"
                value={birthday}
                onChange={setBirthday}
              />

              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-black/60">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-accent"
                />
                מעוניינת לקבל מבצעים בדוא&quot;ל ובסמס (כולל סופ&quot;ש מבצעים מיוחדים) מחברת תמר קוסמטיקס בהתאם
                למדיניות הפרטיות
              </label>

              <button
                type="submit"
                disabled={status === "loading" || !consent}
                className="mt-1 w-full rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(213,32,39,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {status === "loading" ? "נרשמת..." : "הרשמה למועדון"}
              </button>

              {status === "error" ? (
                <p className="text-sm text-brand-accent">משהו השתבש, נסי שוב מאוחר יותר.</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
