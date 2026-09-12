import { fetchGraphQL } from "./client";
import { sessionRequestHeader, readSessionToken } from "./session";
import {
  GET_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM_QUANTITIES,
  REMOVE_CART_ITEMS,
  APPLY_COUPON,
  REMOVE_COUPON,
  UPDATE_SHIPPING_METHOD,
} from "./mutations/cart";
import type { Cart } from "@/types/cart";

interface GqlCart {
  isEmpty: boolean;
  chosenShippingMethods: string[] | null;
  availableShippingMethods: { packageDetails: string; rates: { id: string; label: string; cost: string }[] }[] | null;
  contents: {
    itemCount: number;
    nodes: {
      key: string;
      quantity: number;
      total: string;
      subtotal: string;
      product: {
        node: {
          id: string;
          databaseId: number;
          slug: string;
          name: string;
          sku?: string | null;
          productCategories?: { nodes: { slug: string }[] };
          image?: { sourceUrl: string; altText: string } | null;
        };
      };
      variation?: { node: { id: string; databaseId: number; name: string } } | null;
    }[];
  };
  appliedCoupons: { code: string; discountAmount: string }[] | null;
  subtotal: string;
  total: string;
  totalTax: string;
  shippingTotal: string;
  discountTotal: string;
}

function normalizeCart(gqlCart: GqlCart | null): Cart {
  if (!gqlCart) {
    return {
      isEmpty: true,
      itemCount: 0,
      items: [],
      appliedCoupons: [],
      subtotal: "0",
      total: "0",
      totalTax: "0",
      shippingTotal: "0",
      discountTotal: "0",
      shippingRates: [],
      chosenShippingMethod: null,
    };
  }

  return {
    isEmpty: gqlCart.isEmpty,
    itemCount: gqlCart.contents.itemCount,
    items: gqlCart.contents.nodes.map((n) => ({
      key: n.key,
      quantity: n.quantity,
      total: n.total,
      subtotal: n.subtotal,
      product: {
        id: n.product.node.id,
        databaseId: n.product.node.databaseId,
        slug: n.product.node.slug,
        name: n.product.node.name,
        sku: n.product.node.sku ?? undefined,
        categories: n.product.node.productCategories?.nodes ?? [],
        image: n.product.node.image
          ? { src: n.product.node.image.sourceUrl, alt: n.product.node.image.altText }
          : undefined,
      },
      variation: n.variation?.node
        ? { id: n.variation.node.id, databaseId: n.variation.node.databaseId, name: n.variation.node.name }
        : undefined,
    })),
    appliedCoupons: gqlCart.appliedCoupons ?? [],
    subtotal: gqlCart.subtotal,
    total: gqlCart.total,
    totalTax: gqlCart.totalTax,
    shippingTotal: gqlCart.shippingTotal,
    discountTotal: gqlCart.discountTotal,
    shippingRates: gqlCart.availableShippingMethods?.[0]?.rates ?? [],
    chosenShippingMethod: gqlCart.chosenShippingMethods?.[0] ?? null,
  };
}

interface CartResult {
  cart: Cart;
  sessionToken: string | null;
}

async function runCartMutation(
  query: string,
  variables: Record<string, unknown>,
  sessionToken: string | null
): Promise<CartResult> {
  const { data, response } = await fetchGraphQL<{ [key: string]: { cart: GqlCart } | GqlCart }>(
    query,
    variables,
    { cache: "no-store", headers: sessionRequestHeader(sessionToken) }
  );
  const key = Object.keys(data)[0];
  const payload = data[key];
  const gqlCart = "cart" in payload ? payload.cart : (payload as GqlCart);
  return { cart: normalizeCart(gqlCart), sessionToken: readSessionToken(response) ?? sessionToken };
}

export async function getCart(sessionToken: string | null): Promise<CartResult> {
  const { data, response } = await fetchGraphQL<{ cart: GqlCart | null }>(
    GET_CART,
    {},
    { cache: "no-store", headers: sessionRequestHeader(sessionToken) }
  );
  return { cart: normalizeCart(data.cart), sessionToken: readSessionToken(response) ?? sessionToken };
}

export function addToCart(
  productId: number,
  quantity: number,
  sessionToken: string | null,
  variationId?: number
) {
  return runCartMutation(ADD_TO_CART, { productId, variationId, quantity }, sessionToken);
}

export function updateCartItemQuantities(
  items: { key: string; quantity: number }[],
  sessionToken: string | null
) {
  return runCartMutation(UPDATE_CART_ITEM_QUANTITIES, { items }, sessionToken);
}

export function removeCartItems(keys: string[], sessionToken: string | null) {
  return runCartMutation(REMOVE_CART_ITEMS, { keys }, sessionToken);
}

export function applyCoupon(code: string, sessionToken: string | null) {
  return runCartMutation(APPLY_COUPON, { code }, sessionToken);
}

export function removeCoupon(codes: string[], sessionToken: string | null) {
  return runCartMutation(REMOVE_COUPON, { codes }, sessionToken);
}

export function updateShippingMethod(methodId: string, sessionToken: string | null) {
  return runCartMutation(UPDATE_SHIPPING_METHOD, { shippingMethods: [methodId] }, sessionToken);
}
