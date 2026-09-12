import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "צור קשר",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-right sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">צור קשר</h1>
      <p className="mb-8 text-black/60">נשמח לעזור — פנו אלינו באחת מהדרכים הבאות.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="tel:0545405470"
          className="flex flex-col items-center gap-2 rounded-xl border border-black/10 p-6 text-center transition-colors hover:border-brand-accent"
        >
          <Phone className="h-6 w-6 text-brand-accent" />
          <span className="font-medium">טלפון</span>
          <span dir="ltr" className="text-sm text-black/60">
            054-5405470
          </span>
        </a>
        <a
          href="mailto:info@tamarcosmetics.co.il"
          className="flex flex-col items-center gap-2 rounded-xl border border-black/10 p-6 text-center transition-colors hover:border-brand-accent"
        >
          <Mail className="h-6 w-6 text-brand-accent" />
          <span className="font-medium">דוא&quot;ל</span>
          <span className="text-sm text-black/60">info@tamarcosmetics.co.il</span>
        </a>
        <a
          href="https://wa.me/972545405470"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-2 rounded-xl border border-black/10 p-6 text-center transition-colors hover:border-brand-accent"
        >
          <MapPin className="h-6 w-6 text-brand-accent" />
          <span className="font-medium">WhatsApp</span>
          <span className="text-sm text-black/60">בין השעות 08:00-20:00</span>
        </a>
      </div>

      <div className="mt-10 rounded-xl bg-brand-soft/40 p-6 text-sm text-black/70">
        <p className="font-medium">שד&apos; משה דיין 113, ירושלים (מרכז פסגת זאב)</p>
        <p className="mt-1">שעות פתיחה: א&apos;-ה&apos; 08:00-17:00 | ו&apos; 09:00-13:00</p>
      </div>
    </div>
  );
}
