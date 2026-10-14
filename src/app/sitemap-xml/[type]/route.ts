import { buildSitemap, buildSitemapIndex, isSitemapType } from "@/lib/sitemaps";

// Public URLs are `/sitemap_index.xml` and `/<type>-sitemap.xml` (rewrites in next.config.ts — a dynamic segment
// can't carry the `-sitemap.xml` suffix). Rendered on request, never at `next build`: the data comes from the plugin's
// one-call /sitemap-data (itself cached an hour in the fetch cache); the CDN header below caches the XML for crawlers.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const body = type === "index" ? await buildSitemapIndex() : isSitemapType(type) ? await buildSitemap(type) : undefined;
  if (body === undefined) return new Response("Not found", { status: 404 });
  // null = the backend (or an older plugin without /sitemap-data) didn't answer: tell crawlers to retry, never cache it.
  if (body === null) return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300", "Cache-Control": "no-store" } });
  return new Response(body, { headers: HEADERS });
}
