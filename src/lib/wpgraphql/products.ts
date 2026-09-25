import { cache } from "react";
import { fetchGraphQLSafe } from "./client";
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_IDS,
  GET_PRODUCT_SLUGS,
} from "./queries/products";
import { getProductLabels, getProductTabs } from "./tamarApi";
import type { Product, ProductAttribute, ProductVariation } from "@/types/product";

/**
 * tamar-headless-api's /product-labels and /product-tabs routes are still
 * stubs that unconditionally return `[]` (see class-stub-routes.php) — until
 * that's implemented, calling them is a pure network round trip for a result
 * we already know. On a product grid that's dozens of concurrent requests to
 * a backend that queues rather than parallelizes them (observed: a 36-product
 * homepage went from ~17s to ~60s once a second carousel was added), for zero
 * behavioral difference. Flip this back on once those routes return real data.
 */
const TAMAR_CUSTOM_FIELDS_ENABLED = false;

interface GqlImage {
  id: string;
  sourceUrl: string;
  altText: string;
}

interface GqlProductNode {
  __typename?: string;
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  onSale?: boolean;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  weight?: string | null;
  averageRating?: number;
  reviewCount?: number;
  image?: GqlImage | null;
  galleryImages?: { nodes: GqlImage[] };
  /** Only requested on list queries (first gallery image only) — a lighter alternative to `galleryImages` for the hover-swap thumbnail. */
  galleryFirstImage?: { nodes: GqlImage[] };
  productCategories?: { nodes: { id: string; name: string; slug: string }[] };
  allPaBrand?: { nodes: { name: string; slug: string; thumbnailUrl?: string | null }[] };
  attributes?: { nodes: { id: string; name: string; label: string; options: string[]; variation: boolean }[] };
  variations?: {
    nodes: {
      id: string;
      databaseId: number;
      name: string;
      price?: string;
      regularPrice?: string;
      salePrice?: string;
      stockStatus?: string;
      attributes?: { nodes: { name: string; value: string }[] };
      image?: GqlImage | null;
    }[];
  };
}

function fromGraphqlProduct(node: GqlProductNode): Product {
  const galleryNodes = node.galleryImages?.nodes ?? node.galleryFirstImage?.nodes ?? [];
  const images = [
    ...(node.image ? [{ id: node.image.id, src: node.image.sourceUrl, alt: node.image.altText }] : []),
    ...galleryNodes.map((n) => ({ id: n.id, src: n.sourceUrl, alt: n.altText })),
  ];

  const attributes: ProductAttribute[] =
    node.attributes?.nodes.map((a) => ({
      id: a.id,
      name: a.name,
      label: a.label,
      options: a.options ?? [],
      variation: a.variation,
    })) ?? [];

  const variations: ProductVariation[] =
    node.variations?.nodes.map((v) => ({
      id: v.id,
      databaseId: v.databaseId,
      name: v.name,
      price: v.price ?? "0",
      regularPrice: v.regularPrice ?? v.price ?? "0",
      salePrice: v.salePrice,
      inStock: v.stockStatus !== "OUT_OF_STOCK",
      attributes: v.attributes?.nodes.map((a) => ({ name: a.name, value: a.value })) ?? [],
      image: v.image ? { id: v.image.id, src: v.image.sourceUrl, alt: v.image.altText } : undefined,
    })) ?? [];

  return {
    id: node.id,
    databaseId: node.databaseId,
    slug: node.slug,
    name: node.name,
    sku: node.sku,
    type: node.__typename === "VariableProduct" || variations.length > 0 ? "variable" : "simple",
    shortDescription: node.shortDescription,
    description: node.description,
    price: node.price ?? "0",
    regularPrice: node.regularPrice ?? node.price ?? "0",
    salePrice: node.salePrice,
    onSale: Boolean(node.onSale),
    inStock: node.stockStatus !== "OUT_OF_STOCK",
    currency: "ILS",
    images,
    categories: node.productCategories?.nodes.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) ?? [],
    labels: [],
    attributes,
    variations,
    tabs: [],
    brand: node.allPaBrand?.nodes[0]?.name,
    brandLogoUrl: node.allPaBrand?.nodes[0]?.thumbnailUrl ?? undefined,
    weight: node.weight || undefined,
    averageRating: node.averageRating ?? 0,
    reviewCount: node.reviewCount ?? 0,
  };
}

/** Enrich a normalized product with data only tamar-headless-api can provide (once built out). */
async function withCustomFields(product: Product): Promise<Product> {
  if (!TAMAR_CUSTOM_FIELDS_ENABLED) return product;

  const [labels, tabs] = await Promise.all([
    getProductLabels(product.databaseId),
    getProductTabs(product.databaseId),
  ]);
  return {
    ...product,
    labels: labels ?? [],
    tabs: tabs ?? [],
  };
}

/**
 * List views (home/PLP) only render sale-badge labels, never the tabs — skip
 * the tabs round trip per product so a 24-product grid doesn't cost 48
 * sequential-ish requests to tamar-headless-api just to load a page nobody
 * reads tabs on.
 */
async function withLabels(product: Product): Promise<Product> {
  if (!TAMAR_CUSTOM_FIELDS_ENABLED) return product;

  const labels = await getProductLabels(product.databaseId);
  return { ...product, labels: labels ?? [] };
}

export interface ListProductsParams {
  category?: string;
  brand?: string;
  search?: string;
  first?: number;
  after?: string;
  orderby?: { field: "PRICE" | "POPULARITY" | "DATE"; order: "ASC" | "DESC" }[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
}

export interface ListProductsResult {
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResult> {
  const data = await fetchGraphQLSafe<{
    products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlProductNode[] };
  }>(
    GET_PRODUCTS,
    {
      first: params.first ?? 24,
      after: params.after,
      category: params.category ? [params.category] : undefined,
      brand: params.brand ? [params.brand] : undefined,
      search: params.search,
      orderby: params.orderby,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      onSale: params.onSale,
    },
    { tags: ["products"], revalidate: 60 }
  );

  if (!data) return { products: [], hasNextPage: false, endCursor: null };

  const products = await Promise.all(data.products.nodes.map((n) => withLabels(fromGraphqlProduct(n))));
  return { products, hasNextPage: data.products.pageInfo.hasNextPage, endCursor: data.products.pageInfo.endCursor };
}

/**
 * Wrapped in React `cache()` because both generateMetadata() and the page
 * call it in the same render — GraphQL goes over POST, and Next only
 * auto-dedupes GET fetches, so without this every product page hit the
 * backend twice for the same product.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const data = await fetchGraphQLSafe<{ product: GqlProductNode | null }>(
    GET_PRODUCT_BY_SLUG,
    { slug },
    { tags: [`product:${slug}`], revalidate: 60 }
  );
  if (!data?.product) return null;
  return withCustomFields(fromGraphqlProduct(data.product));
});

/** Card-level data for many products in one request, returned in the order of `ids`. */
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const data = await fetchGraphQLSafe<{ products: { nodes: GqlProductNode[] } }>(
    GET_PRODUCTS_BY_IDS,
    { ids, first: ids.length },
    { tags: ["products"], revalidate: 60 }
  );
  const byId = new Map((data?.products.nodes ?? []).map((n) => [n.databaseId, fromGraphqlProduct(n)]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export async function listProductSlugs(): Promise<string[]> {
  const data = await fetchGraphQLSafe<{ products: { nodes: { slug: string }[] } }>(
    GET_PRODUCT_SLUGS,
    {},
    { tags: ["products"], revalidate: 3600 }
  );
  return data?.products.nodes.map((n) => n.slug) ?? [];
}
