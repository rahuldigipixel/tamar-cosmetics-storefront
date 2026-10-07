import { PRODUCT_LIST_FIELDS } from "./products";
import { BRAND_DETAIL_FIELDS } from "./brands";
import { PRICE_BOUND_FIELDS } from "../priceBounds";

const BRAND_PRODUCTS_WHERE = /* GraphQL */ `{ status: "publish", taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $brand }] } }`;
const brandProductsByPrice = (order: "ASC" | "DESC") =>
  /* GraphQL */ `{ status: "publish", taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $brand }] }, orderby: [{ field: PRICE, order: ${order} }] }`;

/**
 * Everything the brand page needs — the brand itself, its first page of
 * products, the full category list, and the brands / countries of origin present
 * on its products (the options of the filter bar) — as ONE request, instead of the
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
    priceLow: products(first: 1, where: ${brandProductsByPrice("ASC")}) {
      ${PRICE_BOUND_FIELDS}
    }
    priceHigh: products(first: 1, where: ${brandProductsByPrice("DESC")}) {
      ${PRICE_BOUND_FIELDS}
    }
    allCategories: productCategories(first: 150, where: { hideEmpty: true }) {
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
    # Brands / countries across ALL of this brand's products (plugin field) — not just the first 100.
    facets: tamarFacets(brand: $slug) {
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
