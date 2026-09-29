import { PRODUCT_LIST_FIELDS } from "./products";

/**
 * Everything the home page renders from WPGraphQL — sale products, best
 * sellers, new arrivals, the admin's manually-curated HOT/NEW/SALE product
 * picks, categories, brands — as ONE request using aliased root fields,
 * instead of 8 separate queries (see getHomeData() in lib/wpgraphql/home.ts).
 * Keeps the site's "2-3 API calls per page" budget: this + the layout's
 * single /global-data call + the settings REST call that supplies
 * $hotIds/$newIds/$saleIds.
 *
 * $hotIds/$newIds/$saleIds default to `[0]` (never a real product id) rather
 * than `[]` — WPGraphQL/WooCommerce's `include` filter is only reliably "no
 * match" with a non-empty, unmatchable list; an empty array risks being
 * treated as "no filter" and returning every product instead.
 */
export const GET_HOME_DATA = /* GraphQL */ `
  query GetHomeData($first: Int = 20, $hotIds: [Int] = [0], $newIds: [Int] = [0], $saleIds: [Int] = [0]) {
    saleProducts: products(first: $first, where: { onSale: true, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    bestSellers: products(first: $first, where: { orderby: [{ field: POPULARITY, order: DESC }], status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    newProducts: products(first: $first, where: { orderby: [{ field: DATE, order: DESC }], status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    hotSelected: products(first: 50, where: { include: $hotIds, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    newSelected: products(first: 50, where: { include: $newIds, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    saleSelected: products(first: 50, where: { include: $saleIds, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    productCategories(first: 400, where: { hideEmpty: false }) {
      nodes {
        id
        databaseId
        name
        slug
        count
        description
        image {
          sourceUrl
          altText
        }
        parent {
          node {
            id
          }
        }
      }
    }
    allPaBrand(first: 300, where: { hideEmpty: false }) {
      nodes {
        id
        databaseId
        name
        slug
        thumbnailUrl
      }
    }
  }
`;
