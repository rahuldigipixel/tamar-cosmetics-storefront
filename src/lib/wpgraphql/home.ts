import { fetchGraphQLSafe } from "./client";
import { GET_HOME_DATA } from "./queries/home";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Product, ProductCategory, Brand } from "@/types/product";

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

export interface HomeData {
  saleProducts: Product[];
  bestSellers: Product[];
  newProducts: Product[];
  /** Admin-curated HOT/NEW/SALE picks (wp-admin → ניהול דף הבית), in the admin's chosen order — empty when nothing's been picked for that rail. */
  hotSelected: Product[];
  newSelected: Product[];
  saleSelected: Product[];
  categories: ProductCategory[];
  brands: Brand[];
}

const EMPTY: HomeData = {
  saleProducts: [],
  bestSellers: [],
  newProducts: [],
  hotSelected: [],
  newSelected: [],
  saleSelected: [],
  categories: [],
  brands: [],
};

/** Reorders a batch-fetched (unordered) product list to match the admin's chosen id order, dropping any id that came back with no matching product (deleted/unpublished since selection). */
function orderByIds(products: Product[], ids: number[]): Product[] {
  if (ids.length === 0) return [];
  const byId = new Map(products.map((p) => [p.databaseId, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

/**
 * All home-page WPGraphQL data (sale/best-seller/new product rails, the
 * admin's manually-curated HOT/NEW/SALE picks, categories, brands) in one
 * request — see GET_HOME_DATA for why this replaces 8 separate queries the
 * page used to fire.
 */
export async function getHomeData(
  first = 20,
  selectedIds: { hot?: number[]; new?: number[]; sale?: number[] } = {}
): Promise<HomeData> {
  const hotIds = selectedIds.hot?.length ? selectedIds.hot : undefined;
  const newIds = selectedIds.new?.length ? selectedIds.new : undefined;
  const saleIds = selectedIds.sale?.length ? selectedIds.sale : undefined;

  const data = await fetchGraphQLSafe<{
    saleProducts: { nodes: GqlProductNode[] };
    bestSellers: { nodes: GqlProductNode[] };
    newProducts: { nodes: GqlProductNode[] };
    hotSelected: { nodes: GqlProductNode[] };
    newSelected: { nodes: GqlProductNode[] };
    saleSelected: { nodes: GqlProductNode[] };
    productCategories: { nodes: GqlCategoryNode[] };
    allPaBrand: { nodes: GqlBrandNode[] };
  }>(
    GET_HOME_DATA,
    { first, hotIds, newIds, saleIds },
    { tags: ["products", "categories", "brands", "home-page"], revalidate: 60 }
  );

  if (!data) return EMPTY;

  const [saleProducts, bestSellers, newProducts, hotSelectedRaw, newSelectedRaw, saleSelectedRaw] = await Promise.all([
    mapProductListNodes(data.saleProducts.nodes),
    mapProductListNodes(data.bestSellers.nodes),
    mapProductListNodes(data.newProducts.nodes),
    mapProductListNodes(data.hotSelected.nodes),
    mapProductListNodes(data.newSelected.nodes),
    mapProductListNodes(data.saleSelected.nodes),
  ]);

  const hotSelected = orderByIds(hotSelectedRaw, selectedIds.hot ?? []);
  const newSelected = orderByIds(newSelectedRaw, selectedIds.new ?? []);
  const saleSelected = orderByIds(saleSelectedRaw, selectedIds.sale ?? []);

  const categories: ProductCategory[] = data.productCategories.nodes.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c.count,
    image: c.image?.sourceUrl,
    parentId: c.parent?.node.id,
  }));

  const brands: Brand[] = data.allPaBrand.nodes.map((b) => ({
    id: b.id,
    databaseId: b.databaseId,
    name: b.name,
    slug: b.slug,
    count: 0,
    thumbnailUrl: b.thumbnailUrl ?? undefined,
  }));

  return { saleProducts, bestSellers, newProducts, hotSelected, newSelected, saleSelected, categories, brands };
}
