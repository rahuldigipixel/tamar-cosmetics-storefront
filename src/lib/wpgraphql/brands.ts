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
