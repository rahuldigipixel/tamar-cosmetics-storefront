import { cache } from "react";
import { getCategoryPageData } from "./categoryPage";

// Hebrew URL segments can reach the category route still percent-encoded (observed for nested /parent/child/
// paths — Next.js doesn't reliably decode every catch-all segment) and/or under a different Unicode normalization
// form than the plain text WPGraphQL returns for `slug` (visually identical, byte-different). decodeURIComponent()
// is a no-op on already-decoded text, so it is safe to always apply.
export function normalizeCategorySlug(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug.normalize("NFC");
  }
}

export const categoryPathKey = (slugPath: string[]) => slugPath.map(normalizeCategorySlug).join("/");

// One request per render for generateMetadata() + the layout's 404 check + the page body (keyed by the URL path
// string, since getCategoryPageData() takes an array, which React cache() would compare by identity).
export const loadCategoryPage = cache((pathKey: string) => {
  const parts = pathKey.split("/");
  return getCategoryPageData(parts[parts.length - 1], 20, parts.slice(0, -1));
});
