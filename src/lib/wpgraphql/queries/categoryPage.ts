import { SEO_FIELDS } from "@/lib/seo";
import { PRODUCT_LIST_FIELDS } from "./products";
import { PRICE_BOUND_FIELDS } from "../priceBounds";

/**
 * Everything the product-category page needs — this category's product
 * grid, the full category list (filters/breadcrumbs), the full brand list,
 * which brand slugs actually appear in this category, AND this category's
 * own name/description/banner (via the plugin's custom `tamarCategoryInfo`
 * field, which resolves reliably including empty categories — see
 * resolve_category_info() in the plugin's class-wc-product-module.php) —
 * as ONE request using aliased root fields, instead of 4 GraphQL calls +
 * 1 REST call. See getCategoryPageData() in lib/wpgraphql/categoryPage.ts.
 */
export const GET_CATEGORY_PAGE_DATA = /* GraphQL */ `
  query GetCategoryPageData($category: [String], $categorySlug: String!, $first: Int = 20, $ancestorSlugs: [String]) {
    seo: tamarSeo(kind: "product_cat", slug: $categorySlug) {
      ${SEO_FIELDS}
    }
    breadcrumbCategories: productCategories(first: 10, where: { slug: $ancestorSlugs, hideEmpty: false }) {
      nodes {
        name
        slug
      }
    }
    categoryInfo: tamarCategoryInfo(slug: $categorySlug) {
      name
      description
      readMore
      extraDescription
      carousel {
        title
        link
        image {
          url
          width
          height
          alt
        }
      }
      banner {
        desktop {
          url
          width
          height
          alt
        }
        mobile {
          url
          width
          height
          alt
        }
      }
    }
    categoryProducts: products(first: $first, where: { categoryIn: $category, status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
    priceLow: products(first: 1, where: { categoryIn: $category, status: "publish", orderby: [{ field: PRICE, order: ASC }] }) {
      ${PRICE_BOUND_FIELDS}
    }
    priceHigh: products(first: 1, where: { categoryIn: $category, status: "publish", orderby: [{ field: PRICE, order: DESC }] }) {
      ${PRICE_BOUND_FIELDS}
    }
    # Brands / countries across the WHOLE category (plugin field) — not just the first 100 products.
    facets: tamarFacets(category: $categorySlug) {
      brands {
        slug
      }
      countries {
        slug
        name
      }
    }
    # Full tree in name order (as the live Categories filter); empty ones are pruned in getCategoryPageData().
    allCategories: productCategories(first: 500, where: { hideEmpty: false, orderby: NAME, order: ASC }) {
      nodes {
        id
        databaseId
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
