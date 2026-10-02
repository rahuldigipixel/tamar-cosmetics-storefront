import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Lock, Mail, MapPin, Phone, Send, Star, Twitter, Youtube } from "lucide-react";
import type { FooterData, SiteLogo } from "@/lib/wpgraphql/tamarApi";

const FALLBACK_LOGO_SRC = "/brand/logo.png";

// Used only if /global-data fails to deliver the footer payload — the real
// content is managed in wp-admin → הגדרות תמר → פוטר (Footer).
const EMPTY_FOOTER: FooterData = {
  description: "",
  social: [],
  newsletter: { enabled: false, title: "", subtitle: "", placeholder: "" },
  columns: [],
  contact: { enabled: false, title: "", phone: "", phoneHours: "", address: "", addressHours: "", whatsappLabel: "" },
  app: { enabled: false, title: "", ratingText: "", ratingStars: 0, iosUrl: "", androidUrl: "" },
  bottom: { copyright: "Tamar Cosmetics", legalLinks: [], sslText: "" },
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82c-.9-.86-1.44-2.06-1.44-3.39h-3.2v14.03c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 1 1 0-5.6c.3 0 .58.05.85.13v-3.26a5.94 5.94 0 0 0-.85-.06 6.02 6.02 0 1 0 6.02 6.02V9.4a8.5 8.5 0 0 0 4.42 1.24v-3.2c-1.1 0-2.13-.34-2.99-.92a5.9 5.9 0 0 1-1-.7z" />
    </svg>
  );
}

// Keys must match Tamar_Footer::SOCIAL_CHOICES on the WP side.
const SOCIAL_ICON_MAP: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  facebook: { label: "Facebook", icon: Facebook },
  instagram: { label: "Instagram", icon: Instagram },
  youtube: { label: "YouTube", icon: Youtube },
  tiktok: { label: "TikTok", icon: TikTokIcon },
  twitter: { label: "X", icon: Twitter },
  linkedin: { label: "LinkedIn", icon: Linkedin },
};

const LINK_CLASS = "inline-block transition-all hover:translate-x-1 hover:text-brand-accent rtl:hover:-translate-x-1";

/** Internal paths (/...) go through next/link; absolute URLs are plain anchors. */
function FooterAnchor({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const APP_BADGE_CLASS =
  "group animate-app-badge relative inline-flex w-40 items-center gap-3 overflow-hidden rounded-2xl border border-black/10 bg-black px-3 py-2.5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:shadow-[0_10px_24px_-8px_rgba(213,32,39,0.4)]";

/** Admin-uploaded store badge (עמודת האפליקציה) — shown instead of the built-in badge when set. */
function AppBadgeImage({ href, image }: { href: string; image: { url: string; width: number; height: number; alt: string } }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-block transition-transform hover:-translate-y-0.5">
      <Image src={image.url} alt={image.alt} width={image.width} height={image.height} className="h-auto max-h-[54px] w-auto max-w-[160px] object-contain" />
    </a>
  );
}

export function Footer({
  logo = null,
  data,
  whatsappNumber,
}: {
  logo?: SiteLogo | null;
  data?: FooterData | null;
  whatsappNumber: string;
}) {
  const footer = data ?? EMPTY_FOOTER;
  const { newsletter, columns, contact, app, bottom } = footer;
  const social = footer.social.filter((item) => SOCIAL_ICON_MAP[item.type]);

  // Brand column + one per admin-defined menu column + optional contact/app columns.
  const gridCols = [
    "1.1fr",
    ...columns.map(() => "0.8fr"),
    ...(contact.enabled ? ["1fr"] : []),
    ...(app.enabled ? ["1fr"] : []),
  ].join(" ");

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
        {newsletter.enabled ? (
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
                <h3 className="text-xl font-bold text-white">{newsletter.title}</h3>
                <p className="mt-1.5 text-base text-white/80">{newsletter.subtitle}</p>
              </div>
              <form className="relative w-full max-w-md sm:w-auto">
                <div className="flex h-12 items-center gap-2 rounded-full border border-white/40 bg-white/20 ps-4 pe-1.5 backdrop-blur-md transition-colors focus-within:border-white focus-within:bg-white/25">
                  <Mail className="h-4.5 w-4.5 shrink-0 text-white/80" />
                  <input
                    type="email"
                    required
                    placeholder={newsletter.placeholder}
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
        ) : null}

        <div
          className="relative mx-auto mt-3 grid max-w-[1400px] gap-8 px-4 py-6 sm:mt-5 sm:gap-10 sm:px-6 sm:py-8 md:[grid-template-columns:var(--footer-cols)]"
          style={{ "--footer-cols": gridCols } as React.CSSProperties}
        >
          <div>
            <Image
              src={logo?.url ?? FALLBACK_LOGO_SRC}
              alt={logo?.alt || "תמר קוסמטיקס"}
              width={logo?.width ?? 120}
              height={logo?.height ?? 66}
              className="h-auto w-28"
            />
            {footer.description ? <p className="mt-4 max-w-xs text-sm">{footer.description}</p> : null}
            {social.length ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {social.map((item) => {
                  const { label, icon: Icon } = SOCIAL_ICON_MAP[item.type];
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/60 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:text-white hover:shadow-md"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.id}>
              {column.title ? (
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">{column.title}</h3>
              ) : null}
              <ul className="space-y-3 text-base">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <FooterAnchor href={link.url} className={LINK_CLASS}>
                      {link.label}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {contact.enabled ? (
            <div>
              <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">{contact.title}</h3>
              <ul className="space-y-3.5 text-base">
                {contact.phone ? (
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-accent">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span>
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-accent" dir="ltr">
                        {contact.phone}
                      </a>
                      {contact.phoneHours ? (
                        <>
                          <br />
                          <span className="text-sm text-black/50">{contact.phoneHours}</span>
                        </>
                      ) : null}
                    </span>
                  </li>
                ) : null}
                {contact.address ? (
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-accent">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>
                      {contact.address}
                      {contact.addressHours ? (
                        <>
                          <br />
                          <span className="text-sm text-black/50">{contact.addressHours}</span>
                        </>
                      ) : null}
                    </span>
                  </li>
                ) : null}
              </ul>
              {contact.whatsappLabel ? (
                <a
                  href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 py-3 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {contact.whatsappLabel}
                </a>
              ) : null}
            </div>
          ) : null}

          {app.enabled ? (
            <div>
              <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-black">{app.title}</h3>
              {app.ratingStars > 0 || app.ratingText ? (
                <div className="mb-3 flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, app.ratingStars) }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
                  ))}
                  {app.ratingText ? <span className="text-sm font-medium text-black/50">{app.ratingText}</span> : null}
                </div>
              ) : null}
              <div className="flex flex-col items-start gap-2">
                {app.iosUrl && app.iosImage ? <AppBadgeImage href={app.iosUrl} image={app.iosImage} /> : app.iosUrl ? (
                  <a href={app.iosUrl} target="_blank" rel="noreferrer" className={APP_BADGE_CLASS}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <svg viewBox="0 0 384 512" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.9c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-92.3zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1 text-right leading-tight">
                      <span className="block text-[13px] text-white/60">הורידו מ-</span>
                      <span className="block truncate text-[15px] font-semibold">App Store</span>
                    </span>
                  </a>
                ) : null}
                {app.androidUrl && app.androidImage ? <AppBadgeImage href={app.androidUrl} image={app.androidImage} /> : app.androidUrl ? (
                  <a
                    href={app.androidUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ animationDelay: "150ms" }}
                    className={APP_BADGE_CLASS}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <svg viewBox="0 0 512 512" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60-34.1c17.7-11.1 17.7-45.7-1.1-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1 text-right leading-tight">
                      <span className="block text-[13px] text-white/60">זמין ב-</span>
                      <span className="block truncate text-[15px] font-semibold">Google Play</span>
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative border-t border-black/5 py-5">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 text-base text-black/50 sm:flex-row sm:px-6">
            <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
              <span>
                © {new Date().getFullYear()} {bottom.copyright}
              </span>
              {bottom.legalLinks.map((link) => (
                <a key={link.id} href={link.url} className="hover:text-brand-accent">
                  {link.label}
                </a>
              ))}
            </span>
            {bottom.sslText ? (
              <span className="flex items-center gap-1.5 text-sm text-black/60">
                <Lock className="h-4 w-4 text-brand-accent" />
                {bottom.sslText}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
