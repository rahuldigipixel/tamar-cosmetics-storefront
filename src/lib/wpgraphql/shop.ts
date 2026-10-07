import { fetchGraphQLSafe } from "./client";
import { GET_SHOP_DATA } from "./queries/shop";
import { categoryTree } from "./brandPage";
import { fromGraphqlBrand, type GqlBrandNode } from "./brands";
import { toPriceBounds } from "./priceBounds";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Brand, CountryOption, Product, ProductCategory } from "@/types/product";

export interface ShopData {
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
  categories: (ProductCategory & { depth: number })[];
  brands: Brand[];
  countries: CountryOption[];
  /** Price range of the whole shop (null if unavailable) — the price slider's ends. */
  priceBounds: { min: number; max: number } | null;
}

/** One combined GraphQL call — see GET_SHOP_DATA. */
export async function getShopData(first = 20): Promise<ShopData> {
  const data = await fetchGraphQLSafe<{
    shopProducts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlProductNode[] };
    priceLow: { nodes: { price?: string | null }[] };
    priceHigh: { nodes: { price?: string | null }[] };
    allCategories: { nodes: { id: string; name: string; slug: string; count: number | null; parent: { node: { id: string } } | null }[] };
    facets: { brands: { slug: string }[]; countries: CountryOption[] } | null;
    allBrands: { nodes: GqlBrandNode[] };
  }>(GET_SHOP_DATA, { first }, { tags: ["products", "categories", "brands"], revalidate: 60 });

  // Backend unreachable/timed out: throw so the route shows its error state rather than a false "no products".
  if (!data) throw new Error("Shop page request failed (backend unreachable or timed out).");

  const brandSlugs = new Set((data.facets?.brands ?? []).map((b) => b.slug));

  return {
    products: await mapProductListNodes(data.shopProducts.nodes),
    hasNextPage: data.shopProducts.pageInfo.hasNextPage,
    endCursor: data.shopProducts.pageInfo.endCursor,
    categories: categoryTree(data.allCategories.nodes),
    brands: data.allBrands.nodes.filter((b) => brandSlugs.has(b.slug)).map(fromGraphqlBrand),
    countries: data.facets?.countries ?? [],
    priceBounds: toPriceBounds(data.priceLow, data.priceHigh),
  };
}
