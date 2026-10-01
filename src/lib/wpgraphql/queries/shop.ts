import { PRODUCT_LIST_FIELDS } from "./products";

/** /shop product grid + the category filter chips in ONE request (the page's whole 2-call budget with /global-data). */
export const GET_SHOP_DATA = /* GraphQL */ `
  query GetShopData($first: Int = 24, $category: [String], $search: String) {
    products(first: $first, where: { categoryIn: $category, search: $search, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    productCategories(first: 150, where: { hideEmpty: true }) {
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
  }
`;
