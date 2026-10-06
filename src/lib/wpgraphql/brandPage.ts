import { cache } from "react";
import { fetchGraphQLSafe } from "./client";
import { GET_BRAND_PAGE_DATA } from "./queries/brandPage";
import { fromGraphqlBrand, type GqlBrandNode } from "./brands";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Brand, CountryOption, Product, ProductCategory } from "@/types/product";

export interface BrandPageData {
  /** null = no such brand (404). */
  brand: Brand | null;
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
  /** Filter-bar options, taken from the brand's own products. */
  categories: ProductCategory[];
  brands: Brand[];
  countries: CountryOption[];
}

/**
 * Wrapped in `cache()` so generateMetadata() and the page share one request.
 * One combined GraphQL call — see GET_BRAND_PAGE_DATA.
 */
export const getBrandPageData = cache(async (slug: string, first = 20): Promise<BrandPageData> => {
  const data = await fetchGraphQLSafe<{
    brand: GqlBrandNode | null;
    brandProducts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlProductNode[] };
    brandFacets: {
      nodes: {
        productCategories?: { nodes: { id: string; name: string; slug: string }[] };
        allPaBrand?: { nodes: GqlBrandNode[] };
        allPaCountry?: { nodes: CountryOption[] };
      }[];
    };
  }>(GET_BRAND_PAGE_DATA, { slug, brand: [slug], first }, { tags: [`brand:${slug}`, "products", "brands"], revalidate: 60 });

  // Backend unreachable/timed out: throw so the route shows its error state rather than a false 404.
  if (!data) throw new Error(`Brand page request for "${slug}" failed (backend unreachable or timed out).`);

  const categories = new Map<string, ProductCategory>();
  const brands = new Map<string, Brand>();
  const countries = new Map<string, CountryOption>();
  for (const node of data.brandFacets.nodes) {
    node.productCategories?.nodes.forEach((c) => categories.set(c.slug, { id: c.id, name: c.name, slug: c.slug, count: 0 }));
    node.allPaBrand?.nodes.forEach((b) => brands.set(b.slug, fromGraphqlBrand(b)));
    node.allPaCountry?.nodes.forEach((c) => countries.set(c.slug, c));
  }

  return {
    brand: data.brand ? fromGraphqlBrand(data.brand) : null,
    products: await mapProductListNodes(data.brandProducts.nodes),
    hasNextPage: data.brandProducts.pageInfo.hasNextPage,
    endCursor: data.brandProducts.pageInfo.endCursor,
    categories: [...categories.values()],
    brands: [...brands.values()],
    countries: [...countries.values()],
  };
});
