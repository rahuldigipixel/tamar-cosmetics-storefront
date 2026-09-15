import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Lock, Mail, MapPin, Phone, Send, Star, Youtube } from "lucide-react";
import type { SiteLogo } from "@/lib/wpgraphql/tamarApi";

const FALLBACK_LOGO_SRC = "/brand/logo.png";

const SHOP_LINKS = [
  { href: "/shop", label: "כל המוצרים" },
  { href: "/shop/nails", label: "ציפורניים" },
  { href: "/shop/pedicure", label: "פדיקור" },
  { href: "/shop/eyebrows", label: "גבות" },
  { href: "/shop?sale=1", label: "מבצעים" },
];

const SERVICE_LINKS = [
  { href: "/contact", label: "צור קשר" },
  { href: "/account/login", label: "החשבון שלי" },
  { href: "/account/orders", label: "מעקב הזמנה" },
  { href: "/wishlist", label: "רשימת המשאלות" },
  { href: "/cart", label: "עגלת קניות" },
];

const LEGAL_LINKS = [
  { href: "https://www.tamarcosmetics.co.il/terms-and-conditions/", label: "מדיניות פרטיות" },
  { href: "https://www.tamarcosmetics.co.il/terms-and-conditions/", label: "תנאי שימוש" },
];

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/TamarCosmeticsIL/", label: "Facebook", icon: Facebook },
  { href: "https://www.instagram.com/tamar_cosmetics_nails/", label: "Instagram", icon: Instagram },
  { href: "https://www.youtube.com/@tamarcosmetics3694", label: "YouTube", icon: Youtube },
  { href: "https://www.tiktok.com/@tamar_cosmetics?lang=he-IL", label: "TikTok", icon: TikTokIcon },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82c-.9-.86-1.44-2.06-1.44-3.39h-3.2v14.03c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 1 1 0-5.6c.3 0 .58.05.85.13v-3.26a5.94 5.94 0 0 0-.85-.06 6.02 6.02 0 1 0 6.02 6.02V9.4a8.5 8.5 0 0 0 4.42 1.24v-3.2c-1.1 0-2.13-.34-2.99-.92a5.9 5.9 0 0 1-1-.7z" />
    </svg>
  );
}

export function Footer({ logo = null }: { logo?: SiteLogo | null }) {
  return (
    <footer className="relative mt-8 overflow-hidden bg-white text-black/70 sm:mt-15">
      {/* wave divider */}
      <svg
        className="-mb-1 block w-full text-brand-soft"
        viewBox="0 0 1440 60"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,24 L1440,60 L0,60 Z" />
      </svg>

      <div className="relative -mt-px bg-gradient-to-b from-brand-soft via-brand-soft/60 to-white">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -top-10 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-accent/10 blur-3xl" />

        {/* Newsletter card */}
        <div className="relative mx-auto max-w-[1400px] px-4 pt-5 sm:px-6">
          <div className="relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-l from-brand-accent to-[#ff6b72] p-6 shadow-[0_20px_50px_-16px_rgba(213,32,39,0.45)] sm:flex-row sm:gap-6 sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -start-10 -bottom-16 h-56 w-56 rounded-full bg-black/10 blur-3xl"
            />

            <div className="relative text-center sm:text-right">
              <h3 className="text-xl font-bold text-white">הצטרפו למועדון הלקוחות</h3>
              <p className="mt-1.5 text-base text-white/80">מבצעים בלעדיים, טיפים מקצועיים ועדכונים ישירות למייל שלכם.</p>
            </div>
            <form className="relative w-full max-w-md sm:w-auto">
              <div className="flex h-12 items-center gap-2 rounded-full border border-white/40 bg-white/20 ps-4 pe-1.5 backdrop-blur-md transition-colors focus-within:border-white focus-within:bg-white/25">
                <Mail className="h-4.5 w-4.5 shrink-0 text-white/80" />
                <input
                  type="email"
                  required
                  placeholder="הדוא&quot;ל שלך"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/70"
                />
                <button
                  type="submit"
                  aria-label="הרשמה"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-accent transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative mx-auto mt-3 grid max-w-[1400px] gap-8 px-4 py-6 sm:mt-5 sm:gap-10 sm:px-6 sm:py-8 md:grid-cols-[1.1fr_0.8fr_0.8fr_1fr_1fr]">
        <div>
          <Image
            src={logo?.url ?? FALLBACK_LOGO_SRC}
            alt={logo?.alt || "תמר קוסמטיקס"}
            width={logo?.width ?? 120}
            height={logo?.height ?? 66}
            className="h-auto w-28"
          />
          <p className="mt-4 max-w-xs text-sm  ">
            חנות למוצרי ציפורניים, פדיקור וגבות — מותגים מובילים, איכות מקצועית ומשלוח מהיר לכל הארץ.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/60 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:text-white hover:shadow-md"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">חנות</h3>
          <ul className="space-y-3 text-base">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block transition-all hover:translate-x-1 hover:text-brand-accent rtl:hover:-translate-x-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">שירות לקוחות</h3>
          <ul className="space-y-3 text-base">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block transition-all hover:translate-x-1 hover:text-brand-accent rtl:hover:-translate-x-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">יצירת קשר</h3>
          <ul className="space-y-3.5 text-base">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-accent">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <a href="tel:054-5405470" className="hover:text-brand-accent" dir="ltr">
                  054-5405470
                </a>
                <br />
                <span className="text-sm text-black/50">בימים א&apos;-ה&apos;, 08:00-17:00</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-accent">
                <MapPin className="h-4 w-4" />
              </span>
              <span>
                שד&apos; משה דיין 113, ירושלים
                <br />
                <span className="text-sm text-black/50">א&apos;-ה&apos; 08:00-17:00 | יום ו&apos; 09:00-13:00</span>
              </span>
            </li>
          </ul>
          <a
            href="https://api.whatsapp.com/send?phone=972545405470"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 py-3 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            WhatsApp שירות לקוחות
          </a>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">הורידו את האפליקציה</h3>
          <div className="mb-3 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
            ))}
            <span className="text-sm font-medium text-black/50">4.9 דירוג באפליקציה</span>
          </div>
          <div className="flex flex-col items-start gap-2">
            <a
              href="https://apps.apple.com/us/app/%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/id6746124253"
              target="_blank"
              rel="noreferrer"
              className="group animate-app-badge relative inline-flex w-40 items-center gap-3 overflow-hidden rounded-2xl border border-black/10 bg-black px-3 py-2.5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:shadow-[0_10px_24px_-8px_rgba(213,32,39,0.4)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <svg viewBox="0 0 384 512" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.9c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-92.3zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-right leading-tight">
                <span className="block text-[10px] text-white/60">הורידו מ-</span>
                <span className="block truncate text-sm font-semibold">App Store</span>
              </span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tamarcosmetics"
              target="_blank"
              rel="noreferrer"
              style={{ animationDelay: "150ms" }}
              className="group animate-app-badge relative inline-flex w-40 items-center gap-3 overflow-hidden rounded-2xl border border-black/10 bg-black px-3 py-2.5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:shadow-[0_10px_24px_-8px_rgba(213,32,39,0.4)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <svg viewBox="0 0 512 512" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60-34.1c17.7-11.1 17.7-45.7-1.1-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-right leading-tight">
                <span className="block text-[10px] text-white/60">זמין ב-</span>
                <span className="block truncate text-sm font-semibold">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </div>

        <div className="relative border-t border-black/5 py-5">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 text-base text-black/50 sm:flex-row sm:px-6">
            <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
              <span>© {new Date().getFullYear()} Tamar Cosmetics. כל הזכויות שמורות.</span>
              {LEGAL_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-brand-accent">
                  {link.label}
                </a>
              ))}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-black/60">
              <Lock className="h-4 w-4 text-brand-accent" />
              תשלום מאובטח ב-SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
