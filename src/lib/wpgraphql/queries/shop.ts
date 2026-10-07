import { PRODUCT_LIST_FIELDS } from "./products";
import { PRICE_BOUND_FIELDS } from "../priceBounds";

/**
 * Everything the /shop page needs — the first page of ALL products, the price
 * slider range, the full category list and the brands / countries of origin
 * (the filter-bar options) — as ONE request (the page's whole 2-call budget
 * with /global-data). See getShopData() in lib/wpgraphql/shop.ts.
 */
export const GET_SHOP_DATA = /* GraphQL */ `
  query GetShopData($first: Int = 20) {
    shopProducts: products(first: $first, where: { status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    priceLow: products(first: 1, where: { status: "publish", orderby: [{ field: PRICE, order: ASC }] }) {
      ${PRICE_BOUND_FIELDS}
    }
    priceHigh: products(first: 1, where: { status: "publish", orderby: [{ field: PRICE, order: DESC }] }) {
      ${PRICE_BOUND_FIELDS}
    }
    allCategories: productCategories(first: 500, where: { hideEmpty: false, orderby: NAME, order: ASC }) {
      nodes {
        id
        name
        slug
        count
        parent {
          node {
            id
          }
        }
      }
    }
    # No args = every non-empty brand / country of the whole shop (plugin field).
    facets: tamarFacets {
      brands {
        slug
      }
      countries {
        slug
        name
      }
    }
    allBrands: allPaBrand(first: 200, where: { hideEmpty: false }) {
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
