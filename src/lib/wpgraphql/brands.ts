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

/**
 * The pa_brand term's "count" meta is stale for most brands here (see
 * GET_BRANDS), so "does this brand actually have a product assigned" has to
 * be checked against real product membership instead. Batched into one
 * request (one aliased `products(first: 1, ...)` lookup per slug) rather
 * than N round trips.
 */
export async function filterSlugsWithProducts(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();

  const variableDefs = slugs.map((_, i) => `$s${i}: [String]`).join(", ");
  const fields = slugs
    .map(
      (_, i) => `
        b${i}: products(first: 1, where: { status: "publish", taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $s${i} }] } }) {
          nodes {
            id
          }
        }
      `
    )
    .join("\n");
  const query = `query BrandProductExistence(${variableDefs}) { ${fields} }`;
  const variables = Object.fromEntries(slugs.map((slug, i) => [`s${i}`, [slug]]));

  const data = await fetchGraphQLSafe<Record<string, { nodes: { id: string }[] }>>(query, variables, {
    tags: ["products"],
    revalidate: 60,
  });
  if (!data) return new Set();

  const withProducts = new Set<string>();
  slugs.forEach((slug, i) => {
    if ((data[`b${i}`]?.nodes.length ?? 0) > 0) withProducts.add(slug);
  });
  return withProducts;
}
