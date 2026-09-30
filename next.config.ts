import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server is reached over the LAN at http://192.168.0.x:3000 (not just
  // localhost) — without this, Next.js blocks the HMR/RSC dev requests from
  // that origin, which silently breaks client-side hydration (buttons render
  // but no event handlers ever attach) while the static HTML still looks fine.
  allowedDevOrigins: ["192.168.0.119", "192.168.0.114"],
  // Wishlist lives at the Hebrew "/רשימת-משאלות" (encoded here for the same reason
  // as the rewrites below); the ASCII /wishlist route is where the page file is,
  // and old /wishlist links redirect to the public URL.
  async redirects() {
    return [
      { source: "/my-account/order-tracking", destination: "/my-account/d-shipment-tracking", permanent: false },
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
      // "/מכירה-סיטונאית" (wholesale page) — same non-ASCII-directory
      // limitation as the brand list rewrite above.
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA", destination: "/wholesale" },
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA/", destination: "/wholesale" },
      // "/ביקורות-לקוחות-תמר-קוסמטיקס" (customer reviews page) — matches the
      // live site's own URL exactly.
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1", destination: "/reviews" },
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA-%D7%AA%D7%9E%D7%A8-%D7%A7%D7%95%D7%A1%D7%9E%D7%98%D7%99%D7%A7%D7%A1/", destination: "/reviews" },
      // "/הנבחרת-הסודית" (secret club page) — same non-ASCII-directory
      // limitation as the brand list rewrite above.
      { source: "/%D7%94%D7%A0%D7%91%D7%97%D7%A8%D7%AA-%D7%94%D7%A1%D7%95%D7%93%D7%99%D7%AA", destination: "/secret-club" },
      { source: "/%D7%94%D7%A0%D7%91%D7%97%D7%A8%D7%AA-%D7%94%D7%A1%D7%95%D7%93%D7%99%D7%AA/", destination: "/secret-club" },
    ];
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
    remotePatterns: [
      // Local backend
      { protocol: "http", hostname: "192.168.0.107", pathname: "/tamarcosmetics_react/wp-content/uploads/**" },
      // Live/staging WordPress backend
      { protocol: "https", hostname: "digipixeldemo.com", pathname: "/tamarcosmetics/wp-content/uploads/**" },
    ],
    // Next.js 16 blocks image optimization for URLs resolving to a private IP by
    // default (SSRF hardening). Our local dev backend (192.168.0.107) is exactly
    // that, so it needs to be explicitly allowed — safe here since the only
    // private-IP source is our own LAN dev server, not user input.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
