import { PRODUCT_LIST_FIELDS } from "./products";

/**
 * Everything the home page renders from WPGraphQL — sale products, best
 * sellers, new arrivals, categories, brands — as ONE request using aliased
 * root fields, instead of 5 separate queries (see getHomeData() in
 * lib/wpgraphql/home.ts). Keeps the site's "2-3 API calls per page" budget:
 * this + the layout's single /global-data call.
 */
export const GET_HOME_DATA = /* GraphQL */ `
  query GetHomeData($first: Int = 20) {
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
    productCategories(first: 150, where: { hideEmpty: true }) {
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
    allPaBrand(first: 200, where: { hideEmpty: false }) {
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
