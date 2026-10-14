import { wpEnv } from "./env";
import { graphqlOperationName, logApiCall } from "./apiAuditLog";
import { localizeMediaUrls } from "./mediaUrl";

export class GraphQLError extends Error {
  constructor(
    message: string,
    public errors: unknown[]
  ) {
    super(message);
    this.name = "GraphQLError";
  }
}

interface FetchGraphQLOptions {
  /** Cache tags for on-demand revalidation via revalidateTag(). */
  tags?: string[];
  /** ISR interval in seconds. Omit for the default fetch cache behavior. */
  revalidate?: number | false;
  /** Extra headers, e.g. woocommerce-session for cart-bound requests. */
  headers?: HeadersInit;
  /** Use "no-store" for user/session-specific requests (cart, account). */
  cache?: RequestCache;
  /** Override the request timeout (ms) — e.g. the checkout mutation, which waits on the payment gateway. */
  timeoutMs?: number;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; path?: (string | number)[] }[];
}

/** True when `path` resolves to an explicit `null` inside `data` (a nullable field that errored out). */
function isNullPath(data: unknown, path?: (string | number)[]): boolean {
  if (!path?.length) return false;
  let node: unknown = data;
  for (const key of path) {
    if (node === null || typeof node !== "object") return false;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node === null;
}

/**
 * Core WPGraphQL/WooGraphQL fetcher. Wraps native fetch so Server Components
 * and Route Handlers can opt into Next.js tag-based ISR (`next: { tags }`)
 * while client-bound requests (cart/account) can pass `cache: "no-store"`.
 * Returns the raw Response too, since cart mutations need to read the
 * `woocommerce-session` response header.
 */
// 20s: the remote (upress) backend needs 10–19s on a cold, uncached query; at 10s those requests were aborted and
// the page rendered a false "not found". Pages cache the result (ISR), so this is only paid on a cold request.
const REQUEST_TIMEOUT_MS = 20_000;

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchGraphQLOptions = {}
): Promise<{ data: T; response: Response }> {
  const { tags, revalidate, headers, cache, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  logApiCall("GraphQL", graphqlOperationName(query));

  // Without a timeout, a stalled/unreachable backend (e.g. a LAN dev IP that
  // isn't on the network right now) hangs the whole page on its loading
  // skeleton for the OS's default TCP timeout (60s+) instead of failing fast.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(wpEnv.graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
      cache: cache ?? (tags || revalidate !== undefined ? undefined : "force-cache"),
      next: cache === "no-store" ? undefined : { tags, revalidate },
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`GraphQL request to ${wpEnv.graphqlUrl} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  const text = localizeMediaUrls(await response.text());
  let json: GraphQLResponse<T>;
  try {
    json = JSON.parse(text) as GraphQLResponse<T>;
  } catch {
    throw new Error(`GraphQL request to ${wpEnv.graphqlUrl} did not return JSON: ${text.slice(0, 300)}`);
  }

  // WPGraphQL answers an unknown slug (`product(id: "x", idType: SLUG)`) with `data.product: null` PLUS an
  // `errors` entry ("No product ID was found…"). That is "not found", not a failed request — otherwise a deleted
  // product/post throws here and the page 500s instead of 404ing. Errors are tolerated only when every one of
  // them points at a field that came back null.
  if (json.errors?.length && !(json.data && json.errors.every((e) => isNullPath(json.data, e.path)))) {
    throw new GraphQLError(json.errors.map((e) => e.message).join("; "), json.errors);
  }
  if (!json.data) {
    throw new Error("GraphQL response had no data and no errors.");
  }

  return { data: json.data, response };
}

/**
 * Safe variant for Server Components rendering the storefront: WooGraphQL may
 * not be activated on every backend environment yet, so callers that need to
 * degrade gracefully (rather than throw a render error) should use this and
 * treat `null` as "fall back" / "show empty state".
 */
export async function fetchGraphQLSafe<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: FetchGraphQLOptions
): Promise<T | null> {
  try {
    const { data } = await fetchGraphQL<T>(query, variables, options);
    return data;
  } catch (error) {
    console.warn("[wpgraphql] request failed:", (error as Error).message);
    return null;
  }
}
