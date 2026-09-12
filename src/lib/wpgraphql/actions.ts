"use server";

import { listProducts, type ListProductsResult } from "./products";

export type CategorySortOption = "POPULARITY" | "PRICE_ASC" | "PRICE_DESC" | "DATE";

function toOrderby(sort: CategorySortOption | undefined) {
  switch (sort) {
    case "PRICE_ASC":
      return [{ field: "PRICE" as const, order: "ASC" as const }];
    case "PRICE_DESC":
      return [{ field: "PRICE" as const, order: "DESC" as const }];
    case "DATE":
      return [{ field: "DATE" as const, order: "DESC" as const }];
    case "POPULARITY":
      return [{ field: "POPULARITY" as const, order: "DESC" as const }];
    default:
      return undefined;
  }
}

/**
 * Powers the category/shop grid's infinite scroll and its sort/price
 * filters — a server action so the client can page through and re-query
 * results without a dedicated API route.
 */
export async function fetchCategoryProducts(params: {
  category: string;
  after: string | null;
  sort?: CategorySortOption;
  minPrice?: number;
  maxPrice?: number;
  first?: number;
}): Promise<ListProductsResult> {
  return listProducts({
    category: params.category,
    after: params.after ?? undefined,
    first: params.first ?? 20,
    orderby: toOrderby(params.sort),
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });
}
