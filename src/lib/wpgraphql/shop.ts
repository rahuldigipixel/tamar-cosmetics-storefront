import { fetchGraphQLSafe } from "./client";
import { GET_SHOP_DATA } from "./queries/shop";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Product, ProductCategory } from "@/types/product";

export async function getShopData(params: { category?: string; search?: string }): Promise<{ products: Product[]; categories: ProductCategory[] }> {
  const data = await fetchGraphQLSafe<{
    products: { nodes: GqlProductNode[] };
    productCategories: { nodes: { id: string; name: string; slug: string; count: number; parent?: { node: { id: string } } | null }[] };
  }>(
    GET_SHOP_DATA,
    { category: params.category ? [params.category] : undefined, search: params.search },
    { tags: ["products", "categories"], revalidate: 60 }
  );
  if (!data) return { products: [], categories: [] };

  return {
    products: await mapProductListNodes(data.products.nodes),
    categories: data.productCategories.nodes.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.count, parentId: c.parent?.node.id })),
  };
}
