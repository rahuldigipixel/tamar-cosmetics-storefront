import { PRODUCT_LIST_FIELDS } from "./products";

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
  query GetCategoryPageData($category: [String], $categorySlug: String!, $first: Int = 20) {
    categoryInfo: tamarCategoryInfo(slug: $categorySlug) {
      name
      description
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
    categoryProductBrands: products(first: 100, where: { categoryIn: $category, status: "publish" }) {
      nodes {
        productCategories {
          nodes {
            slug
          }
        }
        allPaBrand {
          nodes {
            slug
          }
        }
      }
    }
    allCategories: productCategories(first: 150, where: { hideEmpty: true }) {
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
