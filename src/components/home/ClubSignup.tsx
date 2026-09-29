"use client";

import { useState } from "react";
import Image from "next/image";

const DEFAULT_HEADING = "את הנבחרת הסודית שלנו את הכרת?";
const DEFAULT_DESCRIPTION =
  "עולם שלם של הטבות ומבצעים סודיים, רק בשבילך. לקוחות הנבחרת הסודית מקבלות יותר, הרבה יותר.";
const DEFAULT_BG_IMAGE = "/את-הנבחרת-הסודית-שלנו-את-הכרת.webp";
const DEFAULT_CHECKBOX_LABEL =
  'מעוניינת לקבל מבצעים בדוא"ל ו/או סמס (בכפוף לתקנון מבצעים סודיים) מחברת תמר קוסמטיקס בהתאם למדיניות הפרטיות';
const DEFAULT_BUTTON_LABEL = "!הירשמי";

export function ClubSignup({
  heading,
  description,
  bgImageUrl,
  checkboxLabel,
  buttonLabel,
}: {
  heading?: string;
  description?: string;
  bgImageUrl?: string;
  /** Raw HTML (e.g. may include a privacy-policy <a> link) — rendered as-is. */
  checkboxLabel?: string;
  buttonLabel?: string;
}) {
  const resolvedHeading = heading || DEFAULT_HEADING;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedBgImage = bgImageUrl || DEFAULT_BG_IMAGE;
  const resolvedCheckboxLabel = checkboxLabel || DEFAULT_CHECKBOX_LABEL;
  const resolvedButtonLabel = buttonLabel || DEFAULT_BUTTON_LABEL;
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
    <section className="w-full overflow-hidden" dir="rtl">
      {/* Split: Visual Right (58% Image) / Visual Left (42% Red Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] w-full">
        
        {/* Visual Right: Delivery Boxes Image */}
        <div className="relative min-h-[380px] w-full sm:min-h-[480px] lg:min-h-[640px]">
          <Image
            src={resolvedBgImage}
            alt="תמר קוסמטיקס - Let the magic of beauty begin"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Visual Left: Red Form Column */}
        <div className="flex flex-col items-center justify-center bg-[#d52027] px-6 py-10 sm:px-12 sm:py-14 lg:px-12 lg:py-16 text-white">
          <div className="w-full max-w-[490px]">
            
            {/* Title - Single line on desktop matching Image 1 */}
            <h2 className="mb-2 text-right text-[22px] sm:text-[25px] lg:text-[27px] font-bold leading-tight tracking-tight text-white">
              {resolvedHeading}
            </h2>

            {/* Subtitle */}
            <p className="mb-6 text-right text-[13.5px] sm:text-[14.5px] leading-relaxed text-white/90">
              {resolvedDescription}
            </p>

            {status === "done" ? (
              <div className="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
                <p className="text-[20px] font-semibold">נרשמת בהצלחה! ברוכה הבאה למועדון 🎉</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Label above field (not a placeholder) for every field,
                    including the date — consistent, simple markup instead
                    of one-off layouts per field. */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="club-name" className="text-[13px] text-white">שם מלא*</label>
                  <input
                    id="club-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-white/70 bg-transparent pb-1 text-[15px] text-white outline-none focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="club-email" className="text-[13px] text-white">אימייל*</label>
                  <input
                    id="club-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-white/70 bg-transparent pb-1 text-[15px] text-white outline-none focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="club-phone" className="text-[13px] text-white">טלפון*</label>
                  <input
                    id="club-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border-b border-white/70 bg-transparent pb-1 text-[15px] text-white outline-none focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="club-birthday" className="text-[13px] text-white">תאריך לידה לקבלת הטבת יום הולדת</label>
                  {/* A real, visible date input (not a hidden-overlay trick
                      — that left the native calendar anchored to the
                      invisible input's own box, detached from the page).
                      The picker-indicator icon is stretched over the whole
                      field and made invisible, so clicking anywhere on the
                      input opens the calendar with no visible icon.
                      lang="en-CA" makes Chromium browsers render/format
                      this control as yyyy-mm-dd (e.g. 2026-09-29) instead
                      of the locale's dd/mm/yyyy. */}
                  <input
                    id="club-birthday"
                    type="date"
                    lang="en-CA"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full cursor-pointer border-b border-white/70 bg-transparent pb-1 text-[15px] text-white outline-none focus:border-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                </div>

                {/* Consent Checkbox — rendered as raw HTML so an admin-set
                    privacy-policy link inside the text works, same as the
                    wholesale form's checkbox label. */}
                <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-right text-[12px] leading-snug text-white  sm:text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white accent-white cursor-pointer"
                  />
                  <span className="[&_a]:underline [&_a]:hover:no-underline" dangerouslySetInnerHTML={{ __html: resolvedCheckboxLabel }} />
                </label>

                {/* Right-aligned (dir="rtl" → justify-start is the right edge) */}
                <div className="mt-5 flex w-full justify-start">
                  <button
                    type="submit"
                    disabled={status === "loading" || !consent}
                    className="h-[42px] min-w-[160px] rounded-full bg-white px-8 text-[17px] font-bold text-[#d52027] shadow-sm transition-all duration-200 hover:bg-[#f6f6f6] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "loading" ? "נרשמת..." : resolvedButtonLabel}
                  </button>
                </div>

                {status === "error" && (
                  <p className="mt-1 text-center text-[13px] text-white">
                    משהו השתבש, אנא נסי שוב מאוחר יותר.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}