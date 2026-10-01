import { cache } from "react";
import { fetchGraphQLSafe } from "./client";
import { GET_HOME_DATA } from "./queries/home";
import { mapProductListNodes, type GqlProductNode } from "./products";
import { localizeMediaUrls } from "./mediaUrl";
import type { HomePageSettings } from "./tamarApi";
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
  /** wp-admin → ניהול דף הבית settings (hero, headings, features, about) — null when the backend call failed. */
  settings: HomePageSettings | null;
  /** The three product rails — already the admin's picks (in their order) or the default list, see Tamar_Home_Page_Settings::default_rail_ids(). */
  hotProducts: Product[];
  newProducts: Product[];
  saleProducts: Product[];
  categories: ProductCategory[];
  brands: Brand[];
}

const EMPTY: HomeData = { settings: null, hotProducts: [], newProducts: [], saleProducts: [], categories: [], brands: [] };

/**
 * All home-page backend data (sale/best-seller/new product rails, categories,
 * brands, and the wp-admin settings + curated HOT/NEW/SALE picks via
 * `tamarHomePage`) in one request — see GET_HOME_DATA.
 */
export const getHomeData = cache(async function getHomeData(): Promise<HomeData> {
  const data = await fetchGraphQLSafe<{
    tamarHomePage: {
      settings: string | null;
      hotProducts: GqlProductNode[] | null;
      newProducts: GqlProductNode[] | null;
      saleProducts: GqlProductNode[] | null;
      categories: GqlCategoryNode[] | null;
      brands: GqlBrandNode[] | null;
    } | null;
  }>(
    GET_HOME_DATA,
    undefined,
    { tags: ["products", "categories", "brands", "home-page"], revalidate: 60 }
  );

  if (!data) return EMPTY;

  const home = data.tamarHomePage;
  const [hotProducts, newProducts, saleProducts] = await Promise.all([
    mapProductListNodes(home?.hotProducts ?? []),
    mapProductListNodes(home?.newProducts ?? []),
    mapProductListNodes(home?.saleProducts ?? []),
  ]);
  const settings = home?.settings ? (JSON.parse(localizeMediaUrls(home.settings)) as HomePageSettings) : null;

  const categories: ProductCategory[] = (home?.categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c.count,
    image: c.image?.sourceUrl,
    parentId: c.parent?.node.id,
  }));

  const brands: Brand[] = (home?.brands ?? []).map((b) => ({
    id: b.id,
    databaseId: b.databaseId,
    name: b.name,
    slug: b.slug,
    count: 0,
    thumbnailUrl: b.thumbnailUrl ?? undefined,
  }));

  return { settings, hotProducts, newProducts, saleProducts, categories, brands };
});
