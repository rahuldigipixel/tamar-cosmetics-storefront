"use client";

import { useState } from "react";
import Image from "next/image";

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
    <section className="w-full overflow-hidden" dir="rtl">
      {/* Split: Visual Right (58% Image) / Visual Left (42% Red Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] w-full">
        
        {/* Visual Right: Delivery Boxes Image */}
        <div className="relative min-h-[380px] w-full sm:min-h-[480px] lg:min-h-[640px]">
          <Image
            src="/את-הנבחרת-הסודית-שלנו-את-הכרת.webp"
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
              את הנבחרת הסודית שלנו את הכרת?
            </h2>

            {/* Subtitle */}
            <p className="mb-6 text-right text-[13.5px] sm:text-[14.5px] leading-relaxed text-white/90">
              עולם שלם של הטבות ומבצעים סודיים, רק בשבילך. לקוחות הנבחרת הסודית מקבלות יותר, הרבה יותר.
            </p>

            {status === "done" ? (
              <div className="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
                <p className="text-[20px] font-semibold">נרשמת בהצלחה! ברוכה הבאה למועדון 🎉</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                
                {/* Full Name */}
                <div className="border-b border-white/70 pb-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="*שם מלא"
                    className="w-full bg-transparent text-right text-[15px] text-white placeholder:text-right placeholder:text-white outline-none focus:border-white"
                  />
                </div>

                {/* Email */}
                <div className="border-b border-white/70 pb-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="*אימייל"
                    className="w-full bg-transparent text-right text-[15px] text-white placeholder:text-right placeholder:text-white outline-none focus:border-white"
                  />
                </div>

                {/* Phone */}
                <div className="border-b border-white/70 pb-1">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="*טלפון"
                    className="w-full bg-transparent text-right text-[15px] text-white placeholder:text-right placeholder:text-white outline-none focus:border-white"
                  />
                </div>

                {/* Birthday Row: Label on RIGHT, "לחצי כאן" on LEFT */}
                <div className="flex items-center justify-between border-b border-white/70 pb-2 pt-1 w-full">
                  {/* Right Item (1st in RTL): Label */}
                  <div className="text-right text-[13px] leading-tight text-white sm:text-[13.5px]">
                    <div>תאריך לידה לקבלת</div>
                    <div>הטבת יום הולדת</div>
                  </div>

                  {/* Left Item (2nd in RTL): Trigger */}
                  <div className="relative text-left">
                    <span className="cursor-pointer text-[13px] text-white underline underline-offset-4 hover:text-white/80">
                      {birthday || "לחצי כאן"}
                    </span>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-right text-[12px] leading-snug text-white/90 sm:text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white accent-white cursor-pointer"
                  />
                  <span>
                    מעוניינת לקבל מבצעים בדוא&quot;ל ו/או סמס (בכפוף לתקנון מבצעים סודיים) מחברת תמר קוסמטיקס בהתאם למדיניות הפרטיות
                  </span>
                </label>

                {/* Centered Button matching Image 1 */}
                <div className="mt-5 flex w-full justify-center">
                  <button
                    type="submit"
                    disabled={status === "loading" || !consent}
                    className="h-[42px] min-w-[160px] rounded-full bg-white px-8 text-[17px] font-bold text-[#d52027] shadow-sm transition-all duration-200 hover:bg-[#f6f6f6] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "loading" ? "נרשמת..." : "!הירשמי"}
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