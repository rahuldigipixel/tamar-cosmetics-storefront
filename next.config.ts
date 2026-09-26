import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server is reached over the LAN at http://192.168.0.x:3000 (not just
  // localhost) — without this, Next.js blocks the HMR/RSC dev requests from
  // that origin, which silently breaks client-side hydration (buttons render
  // but no event handlers ever attach) while the static HTML still looks fine.
  allowedDevOrigins: ["192.168.0.119", "192.168.0.114"],
  // The brand list page's public URL is the Hebrew "/מותג/" (per product
  // spec). A literal non-ASCII directory under src/app breaks static
  // prerendering (`InvalidCharacterError` building the route's URL pattern),
  // so the page itself lives at the ASCII `/brand-list` route instead. The
  // rewrite `source` must be given percent-encoded (%D7%9E%D7%95%D7%AA%D7%92
  // = "מותג") — the literal Hebrew string here never matches the incoming
  // request path, confirmed against the dev server.
  async rewrites() {
    return [
      { source: "/%D7%9E%D7%95%D7%AA%D7%92", destination: "/brand-list" },
      { source: "/%D7%9E%D7%95%D7%AA%D7%92/", destination: "/brand-list" },
      // "/מכירה-סיטונאית" (wholesale page) — same non-ASCII-directory
      // limitation as the brand list rewrite above.
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA", destination: "/wholesale" },
      { source: "/%D7%9E%D7%9B%D7%99%D7%A8%D7%94-%D7%A1%D7%99%D7%98%D7%95%D7%A0%D7%90%D7%99%D7%AA/", destination: "/wholesale" },
      // "/ביקורות-לקוחות" (customer reviews page)
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA", destination: "/reviews" },
      { source: "/%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA/", destination: "/reviews" },
    ];
  },
  images: {
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
