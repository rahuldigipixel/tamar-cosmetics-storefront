import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
