import type { MetadataRoute } from "next";
import { absoluteUrl, isStagingHost } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Temporary host (vercel.app preview): keep the whole copy out of search until NEXT_PUBLIC_SITE_URL is the real domain.
  if (isStagingHost) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / transactional / thin pages that should never be indexed.
      disallow: ["/cart", "/checkout", "/my-account", "/account", "/wishlist", "/search", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
