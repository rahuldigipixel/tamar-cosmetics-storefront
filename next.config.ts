import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server is reached over the LAN at http://192.168.0.x:3000 (not just
  // localhost) — without this, Next.js blocks the HMR/RSC dev requests from
  // that origin, which silently breaks client-side hydration (buttons render
  // but no event handlers ever attach) while the static HTML still looks fine.
  allowedDevOrigins: ["192.168.0.119", "192.168.0.114"],
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
