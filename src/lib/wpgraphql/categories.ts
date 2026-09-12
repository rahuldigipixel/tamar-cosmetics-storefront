import { fetchGraphQLSafe } from "./client";
import { GET_CATEGORIES } from "./queries/categories";
import type { ProductCategory } from "@/types/product";

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

export async function listCategories(): Promise<ProductCategory[]> {
  const data = await fetchGraphQLSafe<{ productCategories: { nodes: GqlCategoryNode[] } }>(
    GET_CATEGORIES,
    {},
    { tags: ["categories"], revalidate: 300 }
  );

  return (
    data?.productCategories.nodes.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      count: c.count,
      image: c.image?.sourceUrl,
      parentId: c.parent?.node.id,
    })) ?? []
  );
}
