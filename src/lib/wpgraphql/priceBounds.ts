/** Cheapest/priciest product of a list, as two aliased one-node queries (see the page queries). */
export const PRICE_BOUND_FIELDS = /* GraphQL */ `
  nodes {
    ... on SimpleProduct {
      price(format: RAW)
    }
    ... on VariableProduct {
      price(format: RAW)
    }
  }
`;

type PriceNodes = { nodes: { price?: string | null }[] } | null | undefined;

/**
 * Slider range for the whole product list (not just the first page): the lowest and
 * highest active price across it. Variable products can come back as "10 - 20", so every
 * number in the string counts. Null when the backend gave nothing usable.
 */
export function toPriceBounds(low: PriceNodes, high: PriceNodes): { min: number; max: number } | null {
  const nums = (n: PriceNodes) =>
    (n?.nodes ?? []).flatMap((p) => (p.price ?? "").match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []).filter(Number.isFinite);
  const lo = nums(low);
  const hi = nums(high);
  if (lo.length === 0 || hi.length === 0) return null;
  const min = Math.floor(Math.min(...lo));
  const max = Math.ceil(Math.max(...hi));
  return { min, max: max > min ? max : min + 1 };
}
