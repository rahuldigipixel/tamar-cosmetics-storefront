/**
 * Dev-only console logging of every backend request (GraphQL + the
 * tamar-headless-api REST endpoints) — so "how many API calls did this page
 * just make, and which ones" is visible directly in the `next dev` terminal
 * instead of needing an ad-hoc audit. See .claude/RULES.md "API requests":
 * every page should stay at 2-3 calls total (1 shared getGlobalData() +
 * 1-2 page-specific calls). Silent in production (no console noise, no
 * per-request overhead on the live site).
 */
export function logApiCall(kind: "GraphQL" | "REST", label: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.log(`[api-call] ${kind} ${label}`);
}

/** Pulls "GetHomeData" out of `query GetHomeData($first: Int) { ... }` for a readable log label instead of dumping the whole query string. */
export function graphqlOperationName(query: string): string {
  return query.match(/\b(?:query|mutation)\s+(\w+)/)?.[1] ?? "(anonymous)";
}
