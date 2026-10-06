import { PRODUCT_LIST_FIELDS } from "./products";
import { BRAND_DETAIL_FIELDS } from "./brands";

const BRAND_PRODUCTS_WHERE = /* GraphQL */ `{ status: "publish", taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $brand }] } }`;

/**
 * Everything the brand page needs — the brand itself, its first page of
 * products, and the categories / brands / countries of origin present on its
 * products (the options of the filter bar) — as ONE request, instead of the
 * old brand lookup + product list pair. See getBrandPageData() in lib/wpgraphql/brandPage.ts.
 */
export const GET_BRAND_PAGE_DATA = /* GraphQL */ `
  query GetBrandPageData($slug: ID!, $brand: [String], $first: Int = 20) {
    brand: paBrand(id: $slug, idType: SLUG) {
      ${BRAND_DETAIL_FIELDS}
    }
    brandProducts: products(first: $first, where: ${BRAND_PRODUCTS_WHERE}) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    brandFacets: products(first: 100, where: ${BRAND_PRODUCTS_WHERE}) {
      nodes {
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        allPaBrand {
          nodes {
            id
            databaseId
            name
            slug
            thumbnailUrl
          }
        }
        allPaCountry {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;
