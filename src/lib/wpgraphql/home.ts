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
  categories: ProductCategory[];
  brands: Brand[];
}

const EMPTY: HomeData = { saleProducts: [], bestSellers: [], newProducts: [], categories: [], brands: [] };

/**
 * All home-page WPGraphQL data (sale/best-seller/new product rails,
 * categories, brands) in one request — see GET_HOME_DATA for why this
 * replaces 5 separate queries the page used to fire.
 */
export async function getHomeData(first = 20): Promise<HomeData> {
  const data = await fetchGraphQLSafe<{
    saleProducts: { nodes: GqlProductNode[] };
    bestSellers: { nodes: GqlProductNode[] };
    newProducts: { nodes: GqlProductNode[] };
    productCategories: { nodes: GqlCategoryNode[] };
    allPaBrand: { nodes: GqlBrandNode[] };
  }>(GET_HOME_DATA, { first }, { tags: ["products", "categories", "brands"], revalidate: 60 });

  if (!data) return EMPTY;

  const [saleProducts, bestSellers, newProducts] = await Promise.all([
    mapProductListNodes(data.saleProducts.nodes),
    mapProductListNodes(data.bestSellers.nodes),
    mapProductListNodes(data.newProducts.nodes),
  ]);

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

  return { saleProducts, bestSellers, newProducts, categories, brands };
}
