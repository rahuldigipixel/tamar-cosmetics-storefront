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

const GET_CATEGORY_PRODUCT_IDS = /* GraphQL */ `
  query GetCategoryProductIds($category: [String]) {
    products(first: 100, where: { categoryIn: $category, status: "publish" }) {
      nodes {
        id
        ... on SimpleProduct {
          productCategories {
            nodes {
              slug
            }
          }
        }
        ... on VariableProduct {
          productCategories {
            nodes {
              slug
            }
          }
        }
      }
    }
  }
`;

/**
 * Which of `candidateSlugs` actually has a product in this category — the
 * brand filter on a category page should only offer brands that would
 * return results, not every brand storewide.
 *
 * This backend's `categoryIn` where-arg has been observed to return a few
 * false positives on its own (confirmed: querying a real child category
 * returned several products that don't actually list it among their own
 * `productCategories`), and combining `categoryIn` with a `taxonomyFilter`
 * in one query compounds that unreliability rather than intersecting the
 * two conditions. So this cross-validates every "in category" result
 * against the product's own `productCategories` field (verified reliable)
 * instead of trusting the where-arg match, then intersects that verified
 * product-id set against each candidate brand's own product-id set (via
 * the direct `paBrand(slug).products` connection, also verified reliable
 * on its own) — two single-condition lookups intersected in JS, rather
 * than one compound query the backend doesn't evaluate correctly.
 */
export async function listBrandSlugsInCategory(categorySlug: string, candidateSlugs: string[]): Promise<Set<string>> {
  if (candidateSlugs.length === 0) return new Set();

  const categoryData = await fetchGraphQLSafe<{
    products: { nodes: { id: string; productCategories?: { nodes: { slug: string }[] } }[] };
  }>(GET_CATEGORY_PRODUCT_IDS, { category: [categorySlug] }, { tags: ["products"], revalidate: 60 });
  const verifiedProductIds = new Set(
    (categoryData?.products.nodes ?? [])
      .filter((n) => n.productCategories?.nodes.some((c) => c.slug === categorySlug))
      .map((n) => n.id)
  );
  if (verifiedProductIds.size === 0) return new Set();

  const variableDefs = candidateSlugs.map((_, i) => `$s${i}: ID!`).join(", ");
  const fields = candidateSlugs
    .map((_, i) => `b${i}: paBrand(id: $s${i}, idType: SLUG) { products(first: 100) { nodes { id } } }`)
    .join("\n");
  const query = `query BrandProductIds(${variableDefs}) { ${fields} }`;
  const variables: Record<string, unknown> = {};
  candidateSlugs.forEach((slug, i) => {
    variables[`s${i}`] = slug;
  });

  const brandData = await fetchGraphQLSafe<Record<string, { products: { nodes: { id: string }[] } } | null>>(
    query,
    variables,
    { tags: ["products"], revalidate: 60 }
  );
  if (!brandData) return new Set();

  const present = new Set<string>();
  candidateSlugs.forEach((slug, i) => {
    const brandProductIds = brandData[`b${i}`]?.products.nodes.map((n) => n.id) ?? [];
    if (brandProductIds.some((id) => verifiedProductIds.has(id))) present.add(slug);
  });
  return present;
}
