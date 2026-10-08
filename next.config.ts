import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run beside the dev server (NEXT_DIST_DIR=.next-prod npm run build) for perf/SEO verification.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // No framework fingerprint in response headers.
  poweredByHeader: false,
  // Dev server is reached over the LAN at http://192.168.0.x:3000 (not just
  // localhost) — without this, Next.js blocks the HMR/RSC dev requests from
  // that origin, which silently breaks client-side hydration (buttons render
  // but no event handlers ever attach) while the static HTML still looks fine.
  allowedDevOrigins: ["192.168.0.119", "192.168.0.114"],
  // Wishlist lives at the Hebrew "/רשימת-משאלות" (encoded here for the same reason
  // as the rewrites below); the ASCII /wishlist route is where the page file is,
  // and old /wishlist links redirect to the public URL.
  async headers() {
    return [
      // Proxied WP uploads (see rewrites): let the browser/CDN cache them.
      { source: "/wp-content/uploads/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/my-account/order-tracking", destination: "/my-account/d-shipment-tracking", permanent: false },
      // Old wholesale slug -> new one.
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA", destination: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", permanent: false },
      { source: "/wishlist", destination: "/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA-%D7%9E%D7%A9%D7%90%D7%9C%D7%95%D7%AA", permanent: false },
    ];
  },
  // The brand list page's public URL is the Hebrew "/מותג/" (per product
  // spec). A literal non-ASCII directory under src/app breaks static
  // prerendering (`InvalidCharacterError` building the route's URL pattern),
  // so the page itself lives at the ASCII `/brand-list` route instead. The
  // rewrite `source` must be given percent-encoded (%D7%9E%D7%95%D7%AA%D7%92
  // = "מותג") — the literal Hebrew string here never matches the incoming
  // request path, confirmed against the dev server.
  async rewrites() {
    const afterFiles = [
      { source: "/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA-%D7%9E%D7%A9%D7%90%D7%9C%D7%95%D7%AA", destination: "/wishlist" },
      { source: "/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA-%D7%9E%D7%A9%D7%90%D7%9C%D7%95%D7%AA/", destination: "/wishlist" },
      { source: "/%D7%9E%D7%95%D7%AA%D7%92", destination: "/brand-list" },
      { source: "/%D7%9E%D7%95%D7%AA%D7%92/", destination: "/brand-list" },
      // "/מכירה-סיטונאית-תמר-קוסמטיקס" (wholesale page) — same non-ASCII-directory
      // limitation as the brand list rewrite above.
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/wholesale" },
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/wholesale" },
      // "/ביקורות-לקוחות-תמר-קוסמטיקס" (customer reviews page) — matches the
      // live site's own URL exactly.
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/reviews" },
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/reviews" },
      // "/שיטת-שילוח-תמר-קוסמטיקס" (shipping method page) — matches the live
      // site's own URL; the page itself lives at the ASCII route.
      { source: "/%D7%A9%D7%99%D7%98%D7%AA-%D7%A9%D7%99%D7%9C%D7%95%D7%97-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/tamar-cosmetics-shipping-method" },
      { source: "/%D7%A9%D7%99%D7%98%D7%AA-%D7%A9%D7%99%D7%9C%D7%95%D7%97-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/tamar-cosmetics-shipping-method" },
      // "/מדיניות-החזר-מוצר" (return policy page) — same ASCII-route approach
      // as the shipping method page above.
      { source: "/%D7%9E%D7%93%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%94%D7%97%D7%96%D7%A8-%D7%9E%D7%95%D7%A6%D7%A8", destination: "/return-policy" },
      { source: "/%D7%9E%D7%93%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%94%D7%97%D7%96%D7%A8-%D7%9E%D7%95%D7%A6%D7%A8/", destination: "/return-policy" },
      // "/מדיניות-ביטול-הזמנה-תמר-קוסמטיקס" (order cancellation page) — matches the live site's URL.
      { source: "/%D7%9E%D7%93%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%91%D7%99%D7%98%D7%95%D7%9C-%D7%94%D7%96%D7%9E%D7%A0%D7%94-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/order-cancellation" },
      { source: "/%D7%9E%D7%93%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%91%D7%99%D7%98%D7%95%D7%9C-%D7%94%D7%96%D7%9E%D7%A0%D7%94-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/order-cancellation" },
      // "/שאלות-נפוצות-אתר-תמר-קוסמטיקס" (FAQ page) — matches the live site's URL.
      { source: "/%D7%A9%D7%90%D7%9C%D7%95%D7%AA-%D7%A0%D7%A4%D7%95%D7%A6%D7%95%D7%AA-%D7%90%D7%AA%D7%A8-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/faq" },
      { source: "/%D7%A9%D7%90%D7%9C%D7%95%D7%AA-%D7%A0%D7%A4%D7%95%D7%A6%D7%95%D7%AA-%D7%90%D7%AA%D7%A8-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/faq" },
      // "/ספקים" (suppliers page) — matches the live site's URL.
      { source: "/%D7%A1%D7%A4%D7%A7%D7%99%D7%9D", destination: "/suppliers" },
      { source: "/%D7%A1%D7%A4%D7%A7%D7%99%D7%9D/", destination: "/suppliers" },
      // wp-admin "heading + editor" content pages — Hebrew public paths matching the live site.
      { source: "/%D7%A9%D7%99%D7%98%D7%AA-%D7%A9%D7%99%D7%9C%D7%95%D7%97-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1-2", destination: "/shipping-method-2" },
      { source: "/%D7%A9%D7%99%D7%98%D7%AA-%D7%A9%D7%99%D7%9C%D7%95%D7%97-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1-2/", destination: "/shipping-method-2" },
      { source: "/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%A9%D7%9C%D7%95%D7%97%D7%99%D7%9D-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%9E%D7%94%D7%99%D7%95%D7%9D-%D7%9C%D7%94%D7%99%D7%95%D7%9D", destination: "/jerusalem-delivery" },
      { source: "/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%A9%D7%9C%D7%95%D7%97%D7%99%D7%9D-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%9E%D7%94%D7%99%D7%95%D7%9D-%D7%9C%D7%94%D7%99%D7%95%D7%9D/", destination: "/jerusalem-delivery" },
      { source: "/%D7%94%D7%A6%D7%94%D7%A8%D7%AA-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA", destination: "/accessibility-statement" },
      { source: "/%D7%94%D7%A6%D7%94%D7%A8%D7%AA-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA/", destination: "/accessibility-statement" },
      { source: "/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%90%D7%99%D7%A1%D7%95%D7%A3-%D7%A2%D7%A6%D7%9E%D7%99", destination: "/self-pickup" },
      { source: "/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%90%D7%99%D7%A1%D7%95%D7%A3-%D7%A2%D7%A6%D7%9E%D7%99/", destination: "/self-pickup" },
      { source: "/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%A7%D7%95%D7%93-%D7%A7%D7%95%D7%A4%D7%95%D7%9F-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/coupon-terms" },
      { source: "/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%A7%D7%95%D7%93-%D7%A7%D7%95%D7%A4%D7%95%D7%9F-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/coupon-terms" },
      { source: "/%D7%90%D7%95%D7%93%D7%95%D7%AA-%D7%97%D7%91%D7%A8%D7%94-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/about-company" },
      { source: "/%D7%90%D7%95%D7%93%D7%95%D7%AA-%D7%97%D7%91%D7%A8%D7%94-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/about-company" },
      { source: "/%D7%A1%D7%A0%D7%99%D7%A3-%D7%94%D7%93%D7%92%D7%9C-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/flagship-branch" },
      { source: "/%D7%A1%D7%A0%D7%99%D7%A3-%D7%94%D7%93%D7%92%D7%9C-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/flagship-branch" },
      { source: "/%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D-%D7%91%D7%9B%D7%A8%D7%98%D7%99%D7%A1-%D7%90%D7%A9%D7%A8%D7%90%D7%99-2", destination: "/credit-card-payments" },
      { source: "/%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D-%D7%91%D7%9B%D7%A8%D7%98%D7%99%D7%A1-%D7%90%D7%A9%D7%A8%D7%90%D7%99-2/", destination: "/credit-card-payments" },
      { source: "/%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%9E%D7%A1%D7%99%D7%98%D7%A7%D7%A1", destination: "/app" },
      { source: "/%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%9E%D7%A1%D7%99%D7%98%D7%A7%D7%A1/", destination: "/app" },
      { source: "/%D7%AA%D7%95-%D7%90%D7%9E%D7%95%D7%9F-%D7%94%D7%A6%D7%99%D7%91%D7%95%D7%A8", destination: "/trust-seal" },
      { source: "/%D7%AA%D7%95-%D7%90%D7%9E%D7%95%D7%9F-%D7%94%D7%A6%D7%99%D7%91%D7%95%D7%A8/", destination: "/trust-seal" },
      // "/הנבחרת-הסודית-תמר-קוסמטיקס" (secret club page) — same non-ASCII-directory
      // limitation as the brand list rewrite above.
      { source: "/%D7%94%D7%A0%D7%91%D7%97%D7%A8%D7%AA-%D7%94%D7%A1%D7%95%D7%93%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/secret-club" },
      { source: "/%D7%94%D7%A0%D7%91%D7%97%D7%A8%D7%AA-%D7%94%D7%A1%D7%95%D7%93%D7%99%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/secret-club" },
    ];
    // Backend on plain http (no valid SSL) can't serve images to an https
    // storefront (mixed content). Proxy uploads server-side; src/lib/wpgraphql/mediaUrl.ts
    // rewrites absolute upload URLs in API responses to these relative paths.
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (wpUrl?.startsWith("http://")) {
      afterFiles.push({ source: "/wp-content/uploads/:path*", destination: `${wpUrl.replace(/\/+$/, "")}/wp-content/uploads/:path*` });
      // GoCredit logo on the checkout (the payment gateway's icon is served from its plugin folder).
      afterFiles.push({
        source: "/wp-content/plugins/woocommerce-gateway-gocredit/assets/img/:path*",
        destination: `${wpUrl.replace(/\/+$/, "")}/wp-content/plugins/woocommerce-gateway-gocredit/assets/img/:path*`,
      });
    }
    return {
      // Product search results live at the WordPress-style "/?s=term&post_type=product"
      // (page: /search). "/" is a real page, so this must run before the filesystem check.
      beforeFiles: [{ source: "/", has: [{ type: "query" as const, key: "s" }], destination: "/search" }],
      afterFiles,
    };
  },
  images: {
    // 90 = hero banner (HeroCarousel); 75 = Next default for everything else.
    qualities: [75, 90],
    // Optimized images are immutable per URL: cache 30 days at the edge/browser (default is 4 h) and serve AVIF where supported.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ["image/avif", "image/webp"],
    // Trimmed from Next's default 8+8 widths: every <img srcSet> lists each width, and
    // the home page renders hundreds of product images, so the default list alone
    // added ~0.5 MB of HTML. 3840/2048w are never needed for these layouts.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256, 384],
    remotePatterns: [
      // Local backend      
      { protocol: "http", hostname: "192.168.0.107", pathname: "/tamarcosmetics/wp-content/uploads/**" },
      // Live/staging WordPress backend
      { protocol: "https", hostname: "digipixeldemo.com", pathname: "/tamarcosmetics/wp-content/uploads/**" },
      // upress dev WordPress backend (both schemes, so switching to https needs no code change)
      { protocol: "http", hostname: "tamarcosmetics-co-il-dev.s808.upress.link", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "tamarcosmetics-co-il-dev.s808.upress.link", pathname: "/wp-content/uploads/**" },
      // Legacy site — default images of the app page (wp-admin → אפליקציית תמר) until replaced by uploads
      { protocol: "https", hostname: "www.tamarcosmetics.co.il", pathname: "/wp-content/uploads/**" },
    ],
    // Next.js 16 blocks image optimization for URLs resolving to a private IP by
    // default (SSRF hardening). Our local dev backend (192.168.0.107) is exactly
    // that, so it needs to be explicitly allowed — safe here since the only
    // private-IP source is our own LAN dev server, not user input.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
