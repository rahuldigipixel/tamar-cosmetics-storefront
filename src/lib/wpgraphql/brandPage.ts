import { cache } from "react";
import { fetchGraphQLSafe } from "./client";
import { GET_BRAND_PAGE_DATA } from "./queries/brandPage";
import { fromGraphqlBrand, type GqlBrandNode } from "./brands";
import { toPriceBounds } from "./priceBounds";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Brand, CountryOption, Product, ProductCategory } from "@/types/product";

export interface BrandPageData {
  /** null = no such brand (404). */
  brand: Brand | null;
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
  /** Categories filter options: the full category list, as on the live site. */
  categories: (ProductCategory & { depth: number })[];
  brands: Brand[];
  countries: CountryOption[];
  /** Price range of the whole brand (null if unavailable) — the price slider's ends. */
  priceBounds: { min: number; max: number } | null;
}

/**
 * Wrapped in `cache()` so generateMetadata() and the page share one request.
 * One combined GraphQL call — see GET_BRAND_PAGE_DATA.
 */
export const getBrandPageData = cache(async (slug: string, first = 20): Promise<BrandPageData> => {
  const data = await fetchGraphQLSafe<{
    brand: GqlBrandNode | null;
    brandProducts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlProductNode[] };
    priceLow: { nodes: { price?: string | null }[] };
    priceHigh: { nodes: { price?: string | null }[] };
    allCategories: { nodes: { id: string; name: string; slug: string; count: number | null; parent: { node: { id: string } } | null }[] };
    facets: { brands: { slug: string }[]; countries: CountryOption[] } | null;
    allBrands: { nodes: GqlBrandNode[] };
  }>(GET_BRAND_PAGE_DATA, { slug, brand: [slug], first }, { tags: [`brand:${slug}`, "products", "brands"], revalidate: 60 });

  // Backend unreachable/timed out: throw so the route shows its error state rather than a false 404.
  if (!data) throw new Error(`Brand page request for "${slug}" failed (backend unreachable or timed out).`);

  const brandSlugs = new Set((data.facets?.brands ?? []).map((b) => b.slug));
  const brands = data.allBrands.nodes.filter((b) => brandSlugs.has(b.slug)).map(fromGraphqlBrand);
  const countries = data.facets?.countries ?? [];

  return {
    brand: data.brand ? fromGraphqlBrand(data.brand) : null,
    products: await mapProductListNodes(data.brandProducts.nodes),
    hasNextPage: data.brandProducts.pageInfo.hasNextPage,
    endCursor: data.brandProducts.pageInfo.endCursor,
    categories: categoryTree(data.allCategories.nodes),
    brands,
    countries,
    priceBounds: toPriceBounds(data.priceLow, data.priceHigh),
  };
});

/** Elementor "Product filters" categories rule: wp-admin drag-and-drop order (as returned by the API), show hierarchy (children under their parent, indented). */
function categoryTree(nodes: { id: string; name: string; slug: string; count: number | null; parent: { node: { id: string } } | null }[]) {
  const ids = new Set(nodes.map((n) => n.id));
  const byParent = new Map<string | null, typeof nodes>();
  for (const n of nodes) {
    const key = n.parent && ids.has(n.parent.node.id) ? n.parent.node.id : null;
    byParent.set(key, [...(byParent.get(key) ?? []), n]);
  }
  const out: (ProductCategory & { depth: number })[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const n of (byParent.get(parent) ?? [])) {
      out.push({ id: n.id, name: n.name, slug: n.slug, count: n.count ?? 0, parentId: n.parent?.node.id, depth });
      walk(n.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}
