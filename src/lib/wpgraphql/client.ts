import { wpEnv } from "./env";

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
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Core WPGraphQL/WooGraphQL fetcher. Wraps native fetch so Server Components
 * and Route Handlers can opt into Next.js tag-based ISR (`next: { tags }`)
 * while client-bound requests (cart/account) can pass `cache: "no-store"`.
 * Returns the raw Response too, since cart mutations need to read the
 * `woocommerce-session` response header.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchGraphQLOptions = {}
): Promise<{ data: T; response: Response }> {
  const { tags, revalidate, headers, cache } = options;

  const response = await fetch(wpEnv.graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    cache: cache ?? (tags || revalidate !== undefined ? undefined : "force-cache"),
    next: cache === "no-store" ? undefined : { tags, revalidate },
  });

  const text = await response.text();
  let json: GraphQLResponse<T>;
  try {
    json = JSON.parse(text) as GraphQLResponse<T>;
  } catch {
    throw new Error(`GraphQL request to ${wpEnv.graphqlUrl} did not return JSON: ${text.slice(0, 300)}`);
  }

  if (json.errors?.length) {
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
