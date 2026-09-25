import { fetchGraphQLSafe } from "./client";
import { GET_BRANDS, GET_BRAND_BY_SLUG } from "./queries/brands";
import type { Brand } from "@/types/product";

interface GqlBrandNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  desktopBannerUrl?: string | null;
  mobileBannerUrl?: string | null;
  extraDescription?: string | null;
}

function fromGraphqlBrand(node: GqlBrandNode): Brand {
  return {
    id: node.id,
    databaseId: node.databaseId,
    name: node.name,
    slug: node.slug,
    count: node.count ?? 0,
    description: node.description ?? undefined,
    thumbnailUrl: node.thumbnailUrl ?? undefined,
    desktopBannerUrl: node.desktopBannerUrl ?? undefined,
    mobileBannerUrl: node.mobileBannerUrl ?? undefined,
    extraDescription: node.extraDescription ?? undefined,
  };
}

export async function listBrands(): Promise<Brand[]> {
  const data = await fetchGraphQLSafe<{ allPaBrand: { nodes: GqlBrandNode[] } }>(
    GET_BRANDS,
    {},
    { tags: ["brands"], revalidate: 300 }
  );

  return data?.allPaBrand.nodes.map(fromGraphqlBrand) ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const data = await fetchGraphQLSafe<{ paBrand: GqlBrandNode | null }>(
    GET_BRAND_BY_SLUG,
    { slug },
    { tags: [`brand:${slug}`], revalidate: 300 }
  );

  return data?.paBrand ? fromGraphqlBrand(data.paBrand) : null;
}

const GET_CATEGORY_PRODUCT_BRANDS = /* GraphQL */ `
  query GetCategoryProductBrands($category: [String]) {
    products(first: 100, where: { categoryIn: $category, status: "publish" }) {
      nodes {
        productCategories {
          nodes {
            slug
          }
        }
        allPaBrand {
          nodes {
            slug
          }
        }
      }
    }
  }
`;

/**
 * Brand slugs that actually have a product in this category — the brand
 * filter on a category page should only offer brands that would return
 * results, not every brand storewide.
 *
 * This backend's `categoryIn` where-arg has been observed to return a few
 * false positives on its own (confirmed: querying a real child category
 * returned several products that don't actually list it among their own
 * `productCategories`), so every result is cross-checked against the
 * product's own `productCategories` before its brands count.
 *
 * One query, slugs only, independent of the brand list — so the category
 * page runs it in parallel with its other fetches. (It used to run after
 * them, followed by a second query with one `paBrand(...)` alias per brand,
 * each pulling up to 100 product ids.)
 */
export async function listBrandSlugsInCategory(categorySlug: string): Promise<Set<string>> {
  const data = await fetchGraphQLSafe<{
    products: {
      nodes: { productCategories?: { nodes: { slug: string }[] }; allPaBrand?: { nodes: { slug: string }[] } }[];
    };
  }>(GET_CATEGORY_PRODUCT_BRANDS, { category: [categorySlug] }, { tags: ["products"], revalidate: 60 });

  const present = new Set<string>();
  for (const node of data?.products.nodes ?? []) {
    if (!node.productCategories?.nodes.some((c) => c.slug === categorySlug)) continue;
    node.allPaBrand?.nodes.forEach((b) => present.add(b.slug));
  }
  return present;
}
