import { absoluteUrl, PUBLIC_PATHS, SITEMAP_STATIC_ROUTES } from "@/lib/seo";
import { getSitemapData, type SitemapData } from "@/lib/wpgraphql/tamarApi";

/**
 * The storefront's sitemap, structured like the Rank Math one on the WordPress site: `/sitemap_index.xml` lists
 * `post-`, `page-`, `product-`, `category-`, `product_cat-` and `pa_brand-sitemap.xml`; each lists URLs with
 * `<lastmod>` (and `<image:image>` for posts/products). Every URL is on the storefront's own host.
 */
export const SITEMAP_TYPES = ["post", "page", "product", "category", "product_cat", "pa_brand"] as const;
export type SitemapType = (typeof SITEMAP_TYPES)[number];

export const isSitemapType = (v: string): v is SitemapType => (SITEMAP_TYPES as readonly string[]).includes(v);

interface Entry {
  loc: string;
  lastmod?: string;
  images?: string[];
}

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const URLSET_OPEN =
  '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
  'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd ' +
  'http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" ' +
  'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Public URL of a storefront path. Slugs arrive decoded (plain Hebrew) — encode them like the WordPress sitemap does. */
const url = (path: string) => absoluteUrl(encodeURI(path));
const uploadUrl = (rel: string) => absoluteUrl(encodeURI(`/wp-content/uploads/${rel.replace(/^\/+/, "")}`));

const latest = (dates: (string | undefined)[]) => dates.filter((d): d is string => !!d).sort().pop();

/** Older plugin builds send bare path strings for terms (no date). */
const term = (t: [string, string] | string): [string, string] => (typeof t === "string" ? [t, ""] : t);

function entriesFor(type: SitemapType, d: SitemapData): Entry[] {
  switch (type) {
    case "post":
      return d.posts.map(([slug, lastmod, img]) => ({ loc: url(`/${slug}/`), lastmod, images: img ? [uploadUrl(img)] : undefined }));
    case "page": {
      const modifiedBySlug = new Map((d.pages ?? []).map(([slug, lastmod]) => [slug, lastmod]));
      const newest = latest((d.pages ?? []).map(([, lastmod]) => lastmod));
      return [
        { loc: url("/"), lastmod: newest },
        // /shop/ is listed in the product sitemap (as Rank Math does), not twice.
        ...SITEMAP_STATIC_ROUTES.filter((route) => route !== "/shop").map((route) => {
          const path = PUBLIC_PATHS[route] ?? route;
          return { loc: url(`${path}/`), lastmod: modifiedBySlug.get(path.replace(/^\//, "")) };
        }),
      ];
    }
    case "product":
      // Rank Math lists the shop page first in the product sitemap.
      return [
        { loc: url("/shop/"), lastmod: latest(d.products.map(([, lastmod]) => lastmod)) },
        ...d.products.map(([slug, lastmod, img]) => ({ loc: url(`/product/${slug}/`), lastmod, images: img ? [uploadUrl(img)] : undefined })),
      ];
    case "category":
      return (d.postCategories ?? []).map(([slug, lastmod]) => ({ loc: url(`/category/${slug}/`), lastmod }));
    case "product_cat":
      return d.categories.map(term).map(([path, lastmod]) => ({ loc: url(`/product-category/${path}/`), lastmod }));
    case "pa_brand":
      return d.brands.map(term).map(([slug, lastmod]) => ({ loc: url(`/brand/${slug}/`), lastmod }));
  }
}

const tag = (name: string, value: string | undefined) => (value ? `\t\t<${name}>${esc(value)}</${name}>\n` : "");

export async function buildSitemapIndex(): Promise<string | null> {
  const d = await getSitemapData();
  if (!d) return null;
  const items = SITEMAP_TYPES.map((type) => {
    const lastmod = latest(entriesFor(type, d).map((e) => e.lastmod));
    return `\t<sitemap>\n${tag("loc", absoluteUrl(`/${type}-sitemap.xml`))}${tag("lastmod", lastmod)}\t</sitemap>\n`;
  });
  return `${XML_HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("")}</sitemapindex>\n`;
}

export async function buildSitemap(type: SitemapType): Promise<string | null> {
  const d = await getSitemapData();
  if (!d) return null;
  const items = entriesFor(type, d).map((e) => {
    const images = (e.images ?? []).map((i) => `\t\t<image:image>\n\t\t\t<image:loc>${esc(i)}</image:loc>\n\t\t</image:image>\n`).join("");
    return `\t<url>\n${tag("loc", e.loc)}${tag("lastmod", e.lastmod)}${images}\t</url>\n`;
  });
  return `${XML_HEAD}${URLSET_OPEN}${items.join("")}</urlset>\n`;
}
