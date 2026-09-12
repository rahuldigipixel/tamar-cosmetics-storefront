/**
 * WooGraphQL ties the cart to a session token instead of cookies: every
 * request that touches the cart must resend the `woocommerce-session` header
 * it received on the previous response, or WooCommerce starts a brand new
 * (empty) cart. Route handlers below are the only place that touches this —
 * client code just carries the opaque token in Zustand's persisted store.
 */
export const SESSION_HEADER = "woocommerce-session";

export function sessionRequestHeader(token: string | null): HeadersInit {
  return token ? { [SESSION_HEADER]: `Session ${token}` } : {};
}

export function readSessionToken(response: Response): string | null {
  const header = response.headers.get(SESSION_HEADER);
  if (!header) return null;
  // WooGraphQL sends back the raw token (no "Session " prefix) on responses.
  return header.replace(/^Session\s+/i, "");
}
