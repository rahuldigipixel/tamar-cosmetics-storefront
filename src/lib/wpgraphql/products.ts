import { cache } from "react";
import { fetchGraphQLSafe } from "./client";
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_IDS,
  GET_PRODUCT_QUICK_VIEW,
} from "./queries/products";
import { getProductLabels, getProductTabs } from "./tamarApi";
import type { Product, ProductAttribute, ProductVariation } from "@/types/product";
import type { HomePageFeature } from "./tamarApi";

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

export interface GqlProductNode {
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
  attributes?: {
    nodes: {
      id: string;
      name: string;
      label: string;
      options: string[];
      variation: boolean;
      /** Global attributes only. */
      terms?: { nodes: { name: string; slug?: string; tamarImageUrl?: string | null }[] };
    }[];
  };
  barcode?: { value: string | null }[];
  tip?: { value: string | null }[];
  tamarCoupon?: { code?: string | null; label?: string | null } | null;
  tamarSliderProducts?:
    | {
        databaseId: number;
        slug: string;
        name: string;
        sku?: string | null;
        price?: string | null;
        regularPrice?: string | null;
        salePrice?: string | null;
        onSale?: boolean | null;
        inStock?: boolean | null;
        purchasable?: boolean | null;
        image?: { url: string; width?: number | null; height?: number | null; alt?: string | null } | null;
      }[]
    | null;
  tamarTabs?: { id: number; title?: string | null; content?: string | null }[] | null;
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
      optionNames: a.terms?.nodes.map((t) => t.name),
      optionImages: a.terms?.nodes.map((t) => t.tamarImageUrl ?? null),
      optionSlugs: a.terms?.nodes.map((t) => t.slug ?? ""),
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
    barcode: node.barcode?.[0]?.value || undefined,
    tamarTip: node.tip?.[0]?.value?.trim() || undefined,
    coupon: node.tamarCoupon?.code ? { code: node.tamarCoupon.code, label: node.tamarCoupon.label ?? "" } : undefined,
    sliderProducts: node.tamarSliderProducts?.map((p) => ({
      databaseId: p.databaseId,
      slug: p.slug,
      name: p.name,
      sku: p.sku || undefined,
      price: p.price || "0",
      regularPrice: p.regularPrice || p.price || "0",
      salePrice: p.salePrice || undefined,
      onSale: Boolean(p.onSale),
      inStock: p.inStock !== false,
      purchasable: p.purchasable !== false,
      image: p.image ? { url: p.image.url, width: p.image.width ?? 150, height: p.image.height ?? 150, alt: p.image.alt ?? "" } : undefined,
    })),
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
    tabs: (node.tamarTabs ?? [])
      .filter((t) => t.title && t.content)
      .map((t) => ({ title: t.title as string, content: t.content as string })),
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
    // Tabs now arrive with the product query (`tamarTabs`); only fall back to the REST stub if that was empty.
    tabs: product.tabs.length > 0 ? product.tabs : (tabs ?? []),
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

/** Shared by listProducts() and getHomeData() (home.ts) so a multi-alias query's per-section nodes map the same way as a plain products() query. */
export function mapProductListNodes(nodes: GqlProductNode[]): Promise<Product[]> {
  return Promise.all(nodes.map((n) => withLabels(fromGraphqlProduct(n))));
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

  const products = await mapProductListNodes(data.products.nodes);
  return { products, hasNextPage: data.products.pageInfo.hasNextPage, endCursor: data.products.pageInfo.endCursor };
}

/** Which optional elements the product page shows — wp-admin → Single Product Settings checkboxes. */
export interface ProductPageVisibility {
  tip: boolean;
  iconBoxes: boolean;
  barcode: boolean;
  coupon: boolean;
  share: boolean;
  unitPrice: boolean;
  iconStrip: boolean;
  /** Flashy "frequently bought together" widget (client-side embed). */
  complementary: boolean;
  /** Flashy "similar products" widget (client-side embed). */
  similar: boolean;
  upsells: boolean;
  related: boolean;
}

export interface ProductPageSettings {
  visibility: ProductPageVisibility;
  features: HomePageFeature[];
  /** Full-width strip under the tabs — image, title and link are each optional. */
  iconStrip: ProductStripItem[];
}

export interface ProductStripItem {
  image: { url: string; width: number; height: number; alt: string } | null;
  title: string;
  link: string;
}

export interface ProductWithRelated {
  product: Product;
  /** Admin-managed single-product-page settings (icon boxes). */
  pageSettings: ProductPageSettings;
  /** WooCommerce's own related-products algorithm (tags + categories + cross-sells) via the `related` field on Product — fetched in the same request as the product itself instead of a second query. */
  related: Product[];
  /** Products linked as upsells in the product's wp-admin "Linked Products" tab. */
  upsells: Product[];
}

/**
 * Wrapped in React `cache()` because both generateMetadata() and the page
 * call it in the same render — GraphQL goes over POST, and Next only
 * auto-dedupes GET fetches, so without this every product page hit the
 * backend twice for the same product. Also carries the related-products rail
 * (WooCommerce's native `related` field) so the product page needs only ONE
 * GraphQL call instead of a second query for the "similar products" slider.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductWithRelated | null> => {
  const data = await fetchGraphQLSafe<{
    product: (GqlProductNode & { related?: { nodes: GqlProductNode[] }; upsell?: { nodes: GqlProductNode[] } }) | null;
    pageSettings: {
      iconStrip?: { title?: string | null; link?: string | null; image?: { url: string; width?: number | null; height?: number | null; alt?: string | null } | null }[] | null;
      visibility?: Partial<Record<keyof ProductPageVisibility, boolean | null>> | null;
      features?:
        | {
            iconType?: string | null;
            icon?: string | null;
            iconImage?: { url: string; width?: number | null; height?: number | null; alt?: string | null } | null;
            title?: string | null;
            subtitle?: string | null;
            link?: string | null;
          }[]
        | null;
    } | null;
  }>(GET_PRODUCT_BY_SLUG, { slug, relatedFirst: 13 }, { tags: [`product:${slug}`, "product-page"], revalidate: 60 });
  if (!data?.product) return null;

  const [product, related, upsells] = await Promise.all([
    withCustomFields(fromGraphqlProduct(data.product)),
    mapProductListNodes(data.product.related?.nodes ?? []),
    mapProductListNodes(data.product.upsell?.nodes ?? []),
  ]);

  // Everything shows unless the admin explicitly switched it off (also the fallback if the backend plugin is older).
  const v = data.pageSettings?.visibility;
  const pageSettings: ProductPageSettings = {
    visibility: {
      tip: v?.tip !== false,
      iconBoxes: v?.iconBoxes !== false,
      barcode: v?.barcode !== false,
      coupon: v?.coupon !== false,
      share: v?.share !== false,
      unitPrice: v?.unitPrice !== false,
      iconStrip: v?.iconStrip !== false,
      complementary: v?.complementary !== false,
      similar: v?.similar !== false,
      upsells: v?.upsells !== false,
      related: v?.related !== false,
    },
    iconStrip: (data.pageSettings?.iconStrip ?? []).map((s) => ({
      image: s.image ? { url: s.image.url, width: s.image.width ?? 72, height: s.image.height ?? 72, alt: s.image.alt ?? "" } : null,
      title: s.title ?? "",
      link: s.link ?? "",
    })).filter((s) => s.image || s.title),
    features: (data.pageSettings?.features ?? []).map((f) => ({
      iconType: f.iconType === "image" && f.iconImage ? "image" : "lucide",
      icon: f.icon ?? "",
      iconImage: f.iconImage
        ? { url: f.iconImage.url, width: f.iconImage.width ?? 60, height: f.iconImage.height ?? 60, alt: f.iconImage.alt ?? "" }
        : null,
      title: f.title ?? "",
      subtitle: f.subtitle ?? "",
      link: f.link ?? "",
    })),
  };

  return { product, related, upsells, pageSettings };
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

/** Detail fields for the quick-view popup (short description, gallery, categories), by database id. */
export async function getQuickViewProduct(databaseId: number): Promise<Product | null> {
  const data = await fetchGraphQLSafe<{ product: GqlProductNode | null }>(
    GET_PRODUCT_QUICK_VIEW,
    { id: String(databaseId) },
    { tags: ["products"], revalidate: 60 }
  );
  return data?.product ? fromGraphqlProduct(data.product) : null;
}
