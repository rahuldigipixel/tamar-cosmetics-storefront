import { cache } from "react";
import { fetchGraphQLSafe } from "./client";

const GET_CHECKOUT_PAGE = /* GraphQL */ `
  query GetCheckoutPage {
    page(id: "checkout", idType: URI) {
      content
    }
  }
`;

const decodeEntities = (s: string) =>
  s
    .replace(/&quot;|&#0?34;|&#8221;|&#8220;/g, '"')
    .replace(/&#0?39;|&#8217;|&#8216;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/**
 * The paragraph shown under the checkout form (wp-admin → Pages → תשלום, an Elementor heading widget).
 * One cached request (`revalidate` + tag) — the page's single backend call besides the shared global-data.
 * Returned as plain text so nothing from the page builder's markup/CSS leaks into the storefront.
 */
export const getCheckoutNotice = cache(async function getCheckoutNotice(): Promise<string> {
  const data = await fetchGraphQLSafe<{ page: { content: string | null } | null }>(
    GET_CHECKOUT_PAGE,
    {},
    { revalidate: 300, tags: ["checkout-page"] }
  );
  const html = data?.page?.content ?? "";
  const heading = /<h2[^>]*elementor-heading-title[^>]*>([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? "";
  return decodeEntities(heading.replace(/<[^>]*>/g, "")).trim();
});
