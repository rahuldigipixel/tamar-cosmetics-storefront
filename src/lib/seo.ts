import type { Metadata } from "next";
import { wpEnv } from "@/lib/wpgraphql/env";

/**
 * SEO fields from Rank Math (wp-admin → Rank Math → per-page meta box / Titles & Meta templates),
 * resolved server-side by the plugin's `tamarSeo` GraphQL field (includes/class-seo.php) and folded
 * into each page's existing query — no extra request.
 */
export interface Seo {
  title: string | null;
  description: string | null;
  /** Comma-separated robots directives ("noindex,nofollow"); "" = Rank Math default (index,follow). */
  robots: string | null;
  /** Custom canonical only (path on the backend site, or absolute URL); "" = the page's own URL. */
  canonical: string | null;
  focusKeyword?: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogImageWidth: number | null;
  ogImageHeight: number | null;
}

/** GraphQL selection shared by every `tamarSeo` alias. */
export const SEO_FIELDS = /* GraphQL */ `
  title
  description
  robots
  canonical
  ogTitle
  ogDescription
  ogImage
  ogImageWidth
  ogImageHeight
`;

export function absoluteUrl(path: string) {
  // Trailing slash on page URLs (`trailingSlash: true` in next.config.ts — same form as the legacy WordPress
  // site; the slashless variant 308-redirects to it), so canonical, og:url, JSON-LD and the sitemap all agree.
  // File-like paths (/brand/logo.png, /wp-content/….jpg, sitemap.xml) stay as they are.
  // Percent-escapes upper-cased ("%d7" → "%D7") so every URL for the same page is byte-identical.
  const p = (path.startsWith("/") ? path : `/${path}`).replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase());
  const qIdx = p.indexOf("?");
  const pathname = qIdx === -1 ? p : p.slice(0, qIdx);
  const query = qIdx === -1 ? "" : p.slice(qIdx + 1);
  const isFile = /\.[a-z0-9]{2,5}$/i.test(pathname);
  const withSlash = isFile ? pathname : `${pathname.replace(/\/+$/, "")}/`;
  return `${wpEnv.siteUrl.replace(/\/$/, "")}${withSlash}${query ? `?${query}` : ""}`;
}

interface SeoFallback {
  /** Used when Rank Math returns nothing (backend down, plugin older). */
  title?: string;
  description?: string;
  image?: string;
}

interface SeoOptions {
  /** Path of this page on the storefront, e.g. "/product/foo" — used for canonical + og:url. */
  path: string;
  fallback?: SeoFallback;
  /** "product": og:type is left out here (Next's openGraph can't emit it) — the page renders `<meta property="og:type">` itself. */
  ogType?: "website" | "article" | "product";
}

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

/**
 * Rank Math output → Next.js Metadata. Titles from Rank Math already contain the site name via its
 * template, so they bypass the layout's "%s | תמר קוסמטיקס" template (`absolute`).
 */
export function seoToMetadata(seo: Seo | null | undefined, { path, fallback, ogType = "website" }: SeoOptions): Metadata {
  const title = clean(seo?.title) || fallback?.title;
  // Never leave a page without a description (Lighthouse/Search Console flag it): site tagline as the last resort.
  const description = toDescription(seo?.description, 160) || fallback?.description || SITE_DESCRIPTION;
  const ogTitle = clean(seo?.ogTitle) || title;
  const ogDescription = toDescription(seo?.ogDescription, 200) || description;
  // Last resort so every shared link gets a preview image (brand logo), when neither Rank Math nor the page has one.
  const rawImage = seo?.ogImage || fallback?.image || "/brand/logo.png";
  const image = /^https?:\/\//i.test(rawImage) ? rawImage : absoluteUrl(rawImage);

  // A custom canonical set in Rank Math wins; a backend-origin one is re-pointed at the storefront.
  let canonical = absoluteUrl(path);
  if (seo?.canonical) {
    canonical = absoluteUrl(/^https?:\/\//i.test(seo.canonical) ? new URL(seo.canonical).pathname : seo.canonical);
  }

  const directives = (seo?.robots ?? "").split(",").map((d) => d.trim());
  const noindex = directives.includes("noindex");
  const nofollow = directives.includes("nofollow");

  return {
    title: title ? { absolute: title } : undefined,
    description: description || undefined,
    alternates: { canonical },
    // Rich-snippet directives (large image previews, full snippets) like the legacy Rank Math output.
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: { index: !noindex, follow: !nofollow, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      locale: "he_IL",
      siteName: "תמר קוסמטיקס",
      // Spread (not `type: undefined`): Next throws "Invalid OpenGraph type" when the key exists with no value.
      ...(ogType === "product" ? {} : { type: ogType }),
      images: image
        ? [{ url: image, width: seo?.ogImageWidth || undefined, height: seo?.ogImageHeight || undefined, alt: ogTitle }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: image ? [image] : undefined,
    },
  };
}

/** Escapes `<` so a JSON-LD payload can never close its own <script> tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "תמר קוסמטיקס",
      url: absoluteUrl("/"),
      logo: absoluteUrl("/brand/favicon-192.png"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      name: "תמר קוסמטיקס",
      url: absoluteUrl("/"),
      inLanguage: "he-IL",
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/search")}?s={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/**
 * Storefront route → the public (legacy WordPress) path it is served under — see the rewrites in
 * next.config.ts. Canonical URLs and the sitemap use the public path, since that is the URL Google
 * already has indexed; the ASCII route is just where the page file lives.
 */
export const PUBLIC_PATHS: Record<string, string> = {
  "/brand-list": "/מותג",
  "/wholesale": "/מכירה-סיטונאית-תמר-קוסמטיקס",
  "/reviews": "/ביקורות-לקוחות-תמר-קוסמטיקס",
  "/tamar-cosmetics-shipping-method": "/שיטת-שילוח-תמר-קוסמטיקס",
  "/return-policy": "/מדיניות-החזר-מוצר",
  "/order-cancellation": "/מדיניות-ביטול-הזמנה-תמר-קוסמטיקס",
  "/faq": "/שאלות-נפוצות-אתר-תמר-קוסמטיקס",
  "/suppliers": "/ספקים",
  "/shipping-method-2": "/שיטת-שילוח-תמר-קוסמטיקס-2",
  "/jerusalem-delivery": "/שירות-משלוחים-בירושלים-מהיום-להיום",
  "/accessibility-statement": "/הצהרת-נגישות",
  "/self-pickup": "/שירות-איסוף-עצמי",
  "/coupon-terms": "/תקנון-קוד-קופון-תמר-קוסמטיקס",
  "/about-company": "/אודות-חברה-תמר-קוסמטיקס",
  "/flagship-branch": "/סניף-הדגל-ירושלים-תמר-קוסמטיקס",
  "/credit-card-payments": "/תשלומים-בכרטיס-אשראי-2",
  "/app": "/אפליקציית-תמר-קומסיטקס",
  "/trust-seal": "/תו-אמון-הציבור",
  "/secret-club": "/הנבחרת-הסודית-תמר-קוסמטיקס",
};

/** Indexable static pages for the sitemap (route → public path is resolved through PUBLIC_PATHS). */
export const SITEMAP_STATIC_ROUTES = [
  "/shop",
  "/blog",
  "/contact",
  "/terms-and-conditions",
  ...Object.keys(PUBLIC_PATHS),
];

export const SITE_DESCRIPTION = "תמר קוסמטיקס - המרכז הארצי לשיווק מוצרים לקוסמטיקאיות אונליין. חנות למוצרי ציפורניים, לק ג'ל, פדיקור וגבות.";

/** HTML → plain text, collapsed, cut at a word boundary for a meta description (~155 chars). */
export function toDescription(html: string | null | undefined, max = 155) {
  const text = (html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;|&#0?34;|&#x22;/gi, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  // Prefer ending on a full sentence (no dangling "…" mid-clause) when one ends in the last ~60% of the budget.
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (sentenceEnd >= max * 0.4) return cut.slice(0, sentenceEnd + 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30))}…`;
}

/** Appends the site name unless the title already carries it. */
export const withBrand = (title: string) => (title.includes("תמר קוסמטיקס") ? title : `${title} | תמר קוסמטיקס`);

/** Metadata for a wp-admin-managed page that has no Rank Math record (heading + editor pages, forms, lists). */
export function pageMetadata({ title, description, route }: { title?: string | null; description?: string | null; route: string }): Metadata {
  return seoToMetadata(null, {
    path: PUBLIC_PATHS[route] ?? route,
    fallback: {
      title: title ? withBrand(title) : undefined,
      description: toDescription(description) || SITE_DESCRIPTION,
    },
  });
}

/** Offer `priceValidUntil`: one year ahead (Google's merchant listings want it; the page is revalidated every minute). */
export function priceValidUntil() {
  return new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
}
