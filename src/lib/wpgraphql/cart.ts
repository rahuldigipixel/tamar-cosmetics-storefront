import { fetchGraphQL } from "./client";
import { sessionRequestHeader, readSessionToken } from "./session";
import {
  GET_CART,
  GET_CHECKOUT_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM_QUANTITIES,
  REMOVE_CART_ITEMS,
  APPLY_COUPON,
  REMOVE_COUPON,
  UPDATE_SHIPPING_METHOD,
  updateCustomerShippingMutation,
} from "./mutations/cart";
import type { Cart, PaymentGateway, ShippingAddress } from "@/types/cart";

interface GqlCart {
  isEmpty: boolean;
  chosenShippingMethods: string[] | null;
  availableShippingMethods: { rates: { id: string; label: string; cost: string }[] }[] | null;
  contents: {
    itemCount: number;
    nodes: {
      key: string;
      quantity: number;
      tamarOfferName?: string | null;
      tamarOfferLocked?: boolean | null;
      total: string;
      subtotal: string;
      product: {
        node: {
          id: string;
          databaseId: number;
          slug: string;
          name: string;
          sku?: string | null;
          regularPrice?: string | null;
          productCategories?: { nodes: { slug: string }[] };
          image?: { sourceUrl: string; altText: string } | null;
        };
      };
      variation?: { node: { id: string; databaseId: number; name: string; regularPrice?: string | null } } | null;
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
      offerName: n.tamarOfferName ?? undefined,
      locked: n.tamarOfferLocked === true,
      regularPrice: n.variation?.node?.regularPrice ?? n.product.node.regularPrice ?? undefined,
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
    // WPGraphQL formats `discountAmount` as a display string ("₪14.99") — keep the bare number like every other amount.
    appliedCoupons: (gqlCart.appliedCoupons ?? []).map((c) => ({
      ...c,
      discountAmount: String(c.discountAmount ?? "").replace(/[^\d.]/g, "") || "0",
    })),
    subtotal: gqlCart.subtotal,
    total: gqlCart.total,
    totalTax: gqlCart.totalTax,
    shippingTotal: gqlCart.shippingTotal,
    discountTotal: gqlCart.discountTotal,
    // WPGraphQL formats `cost` as a display string ("₪29.90") — keep the bare number like every other amount in the cart.
    shippingRates: (gqlCart.availableShippingMethods?.[0]?.rates ?? []).map((r) => ({
      ...r,
      cost: String(r.cost ?? "").replace(/[^\d.]/g, "") || "0",
    })),
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

export async function getCart(sessionToken: string | null): Promise<CartResult & { shippingAddress: ShippingAddress | null }> {
  const { data, response } = await fetchGraphQL<{
    cart: GqlCart | null;
    customer: { shipping: { state: string | null; city: string | null } | null } | null;
  }>(GET_CART, {}, { cache: "no-store", headers: sessionRequestHeader(sessionToken) });
  const shipping = data.customer?.shipping;
  return {
    cart: normalizeCart(data.cart),
    sessionToken: readSessionToken(response) ?? sessionToken,
    shippingAddress: shipping?.state || shipping?.city ? { state: shipping.state ?? "", city: shipping.city ?? "" } : null,
  };
} 

export async function getCheckoutCart(sessionToken: string | null) {
  const { data, response } = await fetchGraphQL<{
    cart: GqlCart | null;
    customer: { shipping: { state: string | null; city: string | null } | null } | null;
    paymentGateways: { nodes: PaymentGateway[] } | null;
  }>(GET_CHECKOUT_CART, {}, { cache: "no-store", headers: sessionRequestHeader(sessionToken) });
  const shipping = data.customer?.shipping;
  return {
    cart: normalizeCart(data.cart),
    sessionToken: readSessionToken(response) ?? sessionToken,
    shippingAddress: shipping?.state || shipping?.city ? { state: shipping.state ?? "", city: shipping.city ?? "" } : null,
    paymentGateways: data.paymentGateways?.nodes ?? [],
  };
}

/**
 * Moves the cart's shipping destination. WooCommerce re-evaluates its shipping zones for the new
 * address (e.g. Jerusalem unlocks pickup + same-day), but keeps the previously chosen method even
 * when it no longer exists — so re-select a valid one (the same method if still offered, else the first).
 */
export async function changeShippingAddress(state: string, city: string, sessionToken: string | null) {
  if (!/^[A-Z]{2}\d*$/.test(state)) throw new Error("invalid_state");
  const mutation = await fetchGraphQL<Record<string, unknown>>(
    updateCustomerShippingMutation(state, city),
    {},
    { cache: "no-store", headers: sessionRequestHeader(sessionToken) }
  );
  // updateCustomer rotates the session token.
  const token = readSessionToken(mutation.response) ?? sessionToken;
  const current = await getCart(token);
  const rates = current.cart.shippingRates;
  const stillValid = rates.some((r) => r.id === current.cart.chosenShippingMethod);
  const shippingAddress = { state, city };
  if (stillValid || rates.length === 0) return { ...current, shippingAddress };
  const fixed = await updateShippingMethod(rates[0].id, current.sessionToken);
  return { ...fixed, shippingAddress };
}

export function addToCart(
  productId: number,
  quantity: number,
  sessionToken: string | null,
  variationId?: number
) {
  return runCartMutation(ADD_TO_CART, { productId, variationId, quantity }, sessionToken);
}

/** An emptied cart must not keep its coupons — WooCommerce would re-apply them to the next items added. */
async function dropCouponsIfEmpty(result: CartResult): Promise<CartResult> {
  const { cart, sessionToken } = result;
  if (!cart.isEmpty && cart.items.length > 0) return result;
  if (cart.appliedCoupons.length === 0) return result;
  return removeCoupon(
    cart.appliedCoupons.map((c) => c.code),
    sessionToken
  );
}

export async function updateCartItemQuantities(
  items: { key: string; quantity: number }[],
  sessionToken: string | null
) {
  return dropCouponsIfEmpty(await runCartMutation(UPDATE_CART_ITEM_QUANTITIES, { items }, sessionToken));
}

export async function removeCartItems(keys: string[], sessionToken: string | null) {
  return dropCouponsIfEmpty(await runCartMutation(REMOVE_CART_ITEMS, { keys }, sessionToken));
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
