import { fetchGraphQLSafe } from "./client";
import { GET_CATEGORY_PAGE_DATA } from "./queries/categoryPage";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { CategoryInfo } from "./tamarApi";
import type { Product, ProductCategory, Brand, CountryOption } from "@/types/product";

interface GqlCategoryNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
  image?: { sourceUrl: string; altText: string } | null;
  parent?: { node: { id: string } } | null;
}

interface GqlBrandNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
}

export interface CategoryPageData {
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
  categories: ProductCategory[];
  brands: Brand[];
  brandSlugsInCategory: Set<string>;
  /** Countries of origin (pa_country) that appear on this category's products. */
  countriesInCategory: CountryOption[];
  info: CategoryInfo | null;
  /** Ancestor categories (incl. empty ones the full list hides) for breadcrumb names. */
  breadcrumbCategories: { name: string; slug: string }[];
}

/**
 * All data the product-category page needs, in one combined GraphQL request
 * — see GET_CATEGORY_PAGE_DATA for why this replaces 4 separate GraphQL
 * queries (listProducts, listCategories, listBrands, listBrandSlugsInCategory)
 * plus the old getCategoryInfo() REST call.
 */
export async function getCategoryPageData(
  categorySlug: string,
  first = 20,
  ancestorSlugs: string[] = []
): Promise<CategoryPageData> {
  // WP stores non-ASCII slugs percent-encoded in lowercase hex, and the
  // `slug` where-arg matches the stored form — send both spellings.
  const ancestorQuery = ancestorSlugs.flatMap((s) => [
    s,
    encodeURIComponent(s).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase()),
  ]);
  const data = await fetchGraphQLSafe<{
    categoryInfo: CategoryInfo | null;
    categoryProducts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlProductNode[] };
    categoryProductBrands: {
      nodes: { productCategories?: { nodes: { slug: string }[] }; allPaBrand?: { nodes: { slug: string }[] }; allPaCountry?: { nodes: CountryOption[] } }[];
    };
    allCategories: { nodes: GqlCategoryNode[] };
    breadcrumbCategories?: { nodes: { name: string; slug: string }[] };
    allBrands: { nodes: GqlBrandNode[] };
  }>(
    GET_CATEGORY_PAGE_DATA,
    { category: [categorySlug], categorySlug, first, ancestorSlugs: ancestorQuery.length ? ancestorQuery : ["-"] },
    { tags: ["products", "categories", "brands", `category-info:${categorySlug}`], revalidate: 60 }
  );

  // Backend unreachable/timed out: throw so the route shows its error state
  // instead of an empty page that looks like a real "category not found" 404.
  if (!data) throw new Error("Category page data request failed (backend unreachable or timed out).");

  const products = await mapProductListNodes(data.categoryProducts.nodes);

  // Cross-checked against the product's own productCategories, same as
  // listBrandSlugsInCategory used to — this backend's categoryIn where-arg
  // has been observed to return a few false positives on its own.
  const brandSlugsInCategory = new Set<string>();
  const countries = new Map<string, CountryOption>();
  for (const node of data.categoryProductBrands.nodes) {
    if (!node.productCategories?.nodes.some((c) => c.slug === categorySlug)) continue;
    node.allPaBrand?.nodes.forEach((b) => brandSlugsInCategory.add(b.slug));
    node.allPaCountry?.nodes.forEach((c) => countries.set(c.slug, c));
  }

  const categories: ProductCategory[] = data.allCategories.nodes.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c.count,
    image: c.image?.sourceUrl,
    parentId: c.parent?.node.id,
  }));

  const brands: Brand[] = data.allBrands.nodes.map((b) => ({
    id: b.id,
    databaseId: b.databaseId,
    name: b.name,
    slug: b.slug,
    count: 0,
    thumbnailUrl: b.thumbnailUrl ?? undefined,
  }));

  return {
    products,
    hasNextPage: data.categoryProducts.pageInfo.hasNextPage,
    endCursor: data.categoryProducts.pageInfo.endCursor,
    categories,
    brands,
    brandSlugsInCategory,
    countriesInCategory: [...countries.values()],
    info: data.categoryInfo,
    breadcrumbCategories: data.breadcrumbCategories?.nodes ?? [],
  };
}
