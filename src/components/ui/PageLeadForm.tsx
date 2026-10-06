"use client";

import { useState } from "react";

interface FieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ id, type, label, value, onChange }: FieldProps) {
  return (
    <div className="flex items-center">
      <label htmlFor={id} className="w-[70px] shrink-0 translate-y-[5px] text-right text-[16px] leading-[20px] text-black">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[40px] min-w-0 flex-1 border-0 border-b border-black bg-transparent text-[16px] text-black outline-none focus:border-[#d52027]"
      />
    </div>
  );
}

interface PageLeadFormProps {
  /** Which wp-admin page form this posts to (allow-listed in /api/page-lead). */
  form: "order-cancellation" | "contact" | "suppliers";
  heading: string;
  /** Contact-page style heading: first word red/bold, the rest light. */
  accentFirstWord?: boolean;
  checkboxLabel: string;
  buttonLabel: string;
  /** First field's label (default "שם מלא"); an asterisk is appended. */
  nameLabel?: string;
  /** Form width classes (default the 420px contact/cancellation form). */
  widthClassName?: string;
  /** Full-width submit button on desktop too (suppliers page). */
  wideButton?: boolean;
  /** Heading spans the whole column above the 420px field group (cancellation page) instead of sitting inside it. */
  wideHeading?: boolean;
}

/** Name/email/phone lead form (order-cancellation + contact pages); posts to /api/page-lead. */
export function PageLeadForm({
  form,
  heading,
  accentFirstWord,
  checkboxLabel,
  buttonLabel,
  nameLabel,
  widthClassName = "max-w-[420px]",
  wideButton,
  wideHeading,
}: PageLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/page-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, name, email, phone }),
      });
      const data = await res.json();
      setStatus(data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="py-8 text-center text-[16px] font-medium text-black">הפרטים התקבלו בהצלחה! ניצור איתך קשר בהקדם.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex w-full ${wideHeading ? "" : widthClassName} flex-col`}>
      {heading ? (
        <h2 className={`mb-5 text-[38px] font-light leading-[38px] text-black lg:text-[48px] lg:leading-[48px] ${wideHeading ? "" : "!mb-0"}`}>
          {accentFirstWord ? (
            <>
              <span className="font-extrabold text-[#d52027]">{heading.split(" ")[0]}</span> {heading.split(" ").slice(1).join(" ")}
            </>
          ) : (
            heading
          )}
        </h2>
      ) : null}

      <div className={`flex w-full flex-col gap-[10px] ${wideHeading ? "max-w-[420px]" : ""}`}>
        <Field id="cancel-name" type="text" label={`${nameLabel || "שם מלא"}*`} value={name} onChange={setName} />
        <Field id="cancel-email" type="email" label="אימייל*" value={email} onChange={setEmail} />
        <Field id="cancel-phone" type="tel" label="טלפון*" value={phone} onChange={setPhone} />

        {checkboxLabel ? (
          <label className="mt-[9px] flex items-start gap-2 text-[13px] leading-[1.4] text-black">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-[2px] h-[13px] w-[13px] shrink-0 accent-[#d52027]"
            />
            {/* Saved from wp-admin as raw HTML so the admin can embed the privacy-policy link. */}
            <span className="[&_a]:underline" dangerouslySetInnerHTML={{ __html: checkboxLabel }} />
          </label>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading" || (Boolean(checkboxLabel) && !agreed)}
          className={`mt-[3px] h-[40px] w-full rounded-full bg-gradient-to-b from-[#e0343b] to-[#d52027] text-[16px] text-white ${wideButton ? "" : "lg:w-[140px]"} shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0`}
        >
          {status === "loading" ? "שולח..." : buttonLabel || "הרשמה"}
        </button>

        {status === "error" ? <p className="text-[16px] text-[#d52027]">משהו השתבש, נסי שוב מאוחר יותר.</p> : null}
      </div>
    </form>
  );
}
