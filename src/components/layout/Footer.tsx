import Link from "next/link";
import Image from "next/image";
import type { FooterData, FooterImage, FooterItem, SiteLogo } from "@/lib/wpgraphql/tamarApi";

/*
 * Footer of the React site — all content (columns, links, texts, images, social
 * icons) is managed in wp-admin → הגדרות תמר → פוטר (see the plugin's
 * includes/class-footer.php) and arrives in the `footer` key of /global-data.
 * Layout/typography were measured against the legacy site (Playwright, 1905px /
 * 390px): 21px headings, 16px links (15px on mobile) — approved exception to the
 * 18px floor, see AGENTS.md. Links/text use `font-family: sans-serif` because the
 * legacy "Open Sans Hebrew" is never actually loaded there (it falls back to the
 * browser default).
 */

// Fixed footer structure (measured on the legacy site): desktop column widths (CSS fr) and mobile order, by column position.
// Not editable in wp-admin — admins only change each column's content.
const COLUMN_WIDTHS = [265, 435, 146, 182, 334];
const COLUMN_MOBILE_ORDER = [2, 5, 4, 3, 6];

const EMPTY_FOOTER: FooterData = { background: null, paymentsImage: null, brand: { social: [], badge: null }, columns: [] };

// Font Awesome Brands glyphs (same as the legacy site). Keys must match Tamar_Footer::SOCIAL_CHOICES on the WP side.
type SocialIcon = { label: string; path: string; viewBox: string; brand: string; plainPath?: string; plainViewBox?: string };
const SOCIAL: Record<string, SocialIcon> = {
  facebook: {
    label: "Facebook",
    brand: "#3b5998",
    viewBox: "0 0 512 512",
    path: "M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z",
    // Plain "f" glyph — the legacy logo-column icon; the button style uses the circled logo above.
    plainViewBox: "0 0 320 512",
    plainPath: "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z",
  },
  instagram: {
    label: "Instagram",
    brand: "#262626",
    viewBox: "0 0 448 512",
    path: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z",
  },
  youtube: {
    label: "YouTube",
    brand: "#cd201f",
    viewBox: "0 0 576 512",
    path: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z",
  },
  tiktok: {
    label: "TikTok",
    brand: "#000000",
    viewBox: "0 0 24 24",
    path: "M16.6 5.82c-.9-.86-1.44-2.06-1.44-3.39h-3.2v14.03c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 1 1 0-5.6c.3 0 .58.05.85.13v-3.26a5.94 5.94 0 0 0-.85-.06 6.02 6.02 0 1 0 6.02 6.02V9.4a8.5 8.5 0 0 0 4.42 1.24v-3.2c-1.1 0-2.13-.34-2.99-.92a5.9 5.9 0 0 1-1-.7z",
  },
  twitter: {
    label: "X",
    brand: "#000000",
    viewBox: "0 0 512 512",
    path: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z",
  },
  linkedin: {
    label: "LinkedIn",
    brand: "#0a66c2",
    viewBox: "0 0 448 512",
    path: "M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z",
  },
};

const HEADING = "text-[16px] font-bold leading-[1.2] text-black md:text-[21px] md:leading-[25.2px]";
const TEXT = "[font-family:sans-serif] text-[15px] leading-[19.5px] text-[#242424] md:text-[16px] md:leading-[21px]";
const LINK_HOVER = "transition-colors hover:text-brand-accent";

/** Internal paths go through next/link (no prefetch — dynamic routes re-run their backend query); others are plain anchors. */
function Anchor({ href, newTab, className, children }: { href: string; newTab?: boolean; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/") && !newTab) {
    return (
      <Link href={href} prefetch={false} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

// SVGs can't be optimized, and absolute URLs (the plugin's pre-first-save default images) aren't in next/image's remote host list.
const isUnoptimized = (url: string) => /\.svg(\?|$)/i.test(url) || /^https?:/i.test(url);

// wp-admin often leaves a footer image's alt empty; fall back to a label from the file name so image-only links and
// logos still have an accessible name (and Google Images has context).
const ALT_BY_FILE: [RegExp, string][] = [
  [/waze/i, "Waze - ניווט לחנות"],
  [/whatsapp/i, "WhatsApp"],
  [/service-phone/i, "שירות לקוחות טלפוני"],
  [/service-text/i, "שירות לקוחות בהודעה"],
  [/trust/i, "תו אמון הציבור"],
  [/payment/i, "אמצעי תשלום: ויזה, מאסטרקארד, ביט ועוד"],
  [/facebook/i, "פייסבוק"],
  [/instagram/i, "אינסטגרם"],
  [/youtube/i, "יוטיוב"],
  [/tiktok/i, "טיקטוק"],
];
const footerAlt = (image: FooterImage) => image.alt?.trim() || ALT_BY_FILE.find(([re]) => re.test(image.url))?.[1] || "תמר קוסמטיקס";

function Img({ image, className }: { image: FooterImage; className?: string }) {
  const w = image.width || 40;
  const h = image.height || 40;
  return (
    <Image
      src={image.url}
      alt={footerAlt(image)}
      width={w}
      height={h}
      unoptimized={isUnoptimized(image.url)}
      className={`block ${className ?? ""}`}
      style={{ width: w, height: h, maxWidth: "none" }}
    />
  );
}

function ItemBlock({ item }: { item: FooterItem }) {
  const { image, imagePos = "none" } = item;

  if (item.kind === "image") {
    if (!image) return null;
    const img = <Img image={image} />;
    return item.url ? (
      <Anchor href={item.url} newTab={item.newTab} className="block w-fit">
        {img}
      </Anchor>
    ) : (
      img
    );
  }

  if (item.kind === "text") {
    const text = <div className={`${TEXT} [&_a]:text-[#242424] [&_a:hover]:text-brand-accent`} dangerouslySetInnerHTML={{ __html: item.html ?? "" }} />;
    if (!image || imagePos === "none") return text;
    const img = item.url ? (
      <Anchor href={item.url} newTab={item.newTab} className="shrink-0">
        <Img image={image} />
      </Anchor>
    ) : (
      <Img image={image} className="shrink-0" />
    );
    return (
      <div className={`flex ${imagePos === "above" ? "flex-col items-start gap-[5px]" : "items-center gap-[30px]"}`}>
        {imagePos === "start" || imagePos === "above" ? img : null}
        {text}
        {imagePos === "end" ? img : null}
      </div>
    );
  }

  // link
  if (!item.url) return null;
  const label = item.label ?? "";
  if (!image || imagePos === "none") {
    return (
      <Anchor href={item.url} newTab={item.newTab} className={`block ${TEXT} ${LINK_HOVER}`}>
        {label}
      </Anchor>
    );
  }
  return (
    <Anchor
      href={item.url}
      newTab={item.newTab}
      className={`flex w-fit ${TEXT} ${LINK_HOVER} ${imagePos === "above" ? "flex-col items-start gap-[5px]" : "items-center gap-[14px]"}`}
    >
      {imagePos === "start" || imagePos === "above" ? <Img image={image} /> : null}
      {label}
      {imagePos === "end" ? <Img image={image} /> : null}
    </Anchor>
  );
}

/** One group of items; consecutive social items share a single row of buttons. */
function Group({ items }: { items: FooterItem[] }) {
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const gap = i === 0 ? 0 : item.gap;
    if (item.kind === "social") {
      const run: FooterItem[] = [];
      while (i < items.length && items[i].kind === "social") run.push(items[i++]);
      i--;
      blocks.push(
        <div key={`s${i}`} className="flex gap-3" style={{ marginTop: gap }}>
          {run.map((s, k) => {
            const icon = SOCIAL[s.social ?? ""];
            if (!icon || !s.url) return null;
            // Instagram is not shown in the mobile button row (it stays in the logo column's icons).
            const hideOnMobile = s.social === "instagram";
            return (
              <a
                key={k}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={icon.label}
                style={{ backgroundColor: icon.brand }}
                className={`${hideOnMobile ? "hidden md:flex" : "flex"} h-[48px] w-[48px] items-center justify-center rounded-[10px] text-white transition-opacity hover:opacity-85`}
              >
                <svg viewBox={icon.viewBox} fill="currentColor" className="h-[22px] w-[22px]" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
              </a>
            );
          })}
        </div>,
      );
      continue;
    }
    blocks.push(
      <div key={`i${i}`} style={{ marginTop: gap }}>
        <ItemBlock item={item} />
      </div>,
    );
  }
  return <div>{blocks}</div>;
}

export function Footer({ logo = null, data }: { logo?: SiteLogo | null; data?: FooterData | null }) {
  // A cached pre-v2 payload (old schema) is treated as empty until the next revalidation.
  const footer = data?.brand ? data : EMPTY_FOOTER;
  const { brand } = footer;
  const payments = footer.paymentsImage;
  const columns = footer.columns.filter((c) => Array.isArray(c.groups));
  const gridCols = ["148px", ...columns.map((_column, i) => `${COLUMN_WIDTHS[i] ?? 200}fr`)].join(" ");
  const social = brand.social.filter((s) => SOCIAL[s.type]);

  return (
    <footer
      className="mt-[50px] bg-white bg-cover bg-[position:50%_100%] bg-no-repeat md:bg-[position:0%_100%]"
      style={footer.background ? { backgroundImage: `url(${footer.background.url})` } : undefined}
    >
      <div
        className="mx-auto grid max-w-[1642px] grid-cols-1 gap-x-5 gap-y-8 px-[15px] pb-[14px] pt-[52px] md:grid-cols-2 md:pt-[62px] xl:[grid-template-columns:var(--footer-cols)] xl:gap-y-0 xl:ps-[27px] xl:pe-1"
        style={{ "--footer-cols": gridCols } as React.CSSProperties}
      >
        {/* Logo + social + round service badge */}
        <div className="order-1 flex flex-col items-center md:col-span-2 xl:order-none xl:col-span-1 xl:w-[120px]">
          {logo ? (
            <Image
              src={logo.url}
              alt={logo.alt || "תמר קוסמטיקס"}
              width={logo.width || 120}
              height={logo.height || 120}
              unoptimized={isUnoptimized(logo.url)}
              className="h-auto w-[120px] md:-mt-[10px]"
            />
          ) : null}
          {social.length ? (
            <div className="mt-[20px] flex items-center">
              {social.map((s) => {
                const icon = SOCIAL[s.type];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={icon.label}
                    className="flex h-[30px] items-center px-[5px] text-black/60 transition-colors hover:text-brand-accent"
                  >
                    <svg viewBox={icon.plainViewBox ?? icon.viewBox} fill="currentColor" className="h-[18px] w-auto" aria-hidden="true">
                      <path d={icon.plainPath ?? icon.path} />
                    </svg>
                  </a>
                );
              })}
            </div>
          ) : null}
          {brand.badge && (brand.badge.textImage || brand.badge.iconImage) ? (
            <a
              href={brand.badge.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="שירות לקוחות בוואטסאפ"
              className="relative mt-[40px] hidden h-[66px] w-[85px] md:block"
            >
              {brand.badge.textImage ? <Img image={brand.badge.textImage} className="absolute start-0 top-0" /> : null}
              {brand.badge.iconImage ? <Img image={brand.badge.iconImage} className="absolute start-[19px] top-[18px]" /> : null}
            </a>
          ) : null}
        </div>

        {/* Admin-defined columns */}
        {columns.map((column, i) => (
          <div
            key={column.id}
            style={{ "--mo": COLUMN_MOBILE_ORDER[i] ?? 50 } as React.CSSProperties}
            className={`order-(--mo) xl:order-none ${column.groups.length > 1 ? "md:col-span-2 xl:col-span-1" : ""}`}
          >
            {column.title || column.mobileTitle ? (
              <h3 className={HEADING}>
                {column.mobileTitle ? (
                  <>
                    <span className="md:hidden">{column.mobileTitle}</span>
                    <span className="hidden md:inline">{column.title}</span>
                  </>
                ) : (
                  column.title
                )}
              </h3>
              
            ) : null}
            <div
              className={`mt-[20px] grid grid-cols-1 gap-x-[14px] ${column.groups.length > 1 ? "md:[grid-template-columns:repeat(var(--groups),minmax(0,1fr))] xl:pe-[39px]" : ""}`}
              style={{ "--groups": column.groups.length } as React.CSSProperties}
            >
              {column.groups.map((items, i) => (
                <Group key={i} items={items} />
              ))}
            </div>
          </div>
        ))}

        {/* Copyright + legal links — mobile only */}
        {footer.copyrightHtml ? (
          <p
            className={`${TEXT} order-[99] px-1 text-center text-[#6b6b6b] md:hidden [&_a]:whitespace-nowrap [&_a]:text-[#242424] [&_a:hover]:text-brand-accent`}
            dangerouslySetInnerHTML={{ __html: footer.copyrightHtml }}
          />
        ) : null}

        {/* Payment logos — mobile only (hidden on desktop in the legacy footer) */}
        {payments ? (
          <div className="order-[100] flex justify-center md:hidden">
            <Image
              src={payments.url}
              alt={footerAlt(payments)}
              width={300}
              height={40}
              unoptimized={isUnoptimized(payments.url)}
              className="block h-auto w-full max-w-[300px]"
            />
          </div>
        ) : null}
      </div>
    </footer>
  );
}
