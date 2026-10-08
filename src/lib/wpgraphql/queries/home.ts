import { SEO_FIELDS } from "@/lib/seo";
import { PRODUCT_LIST_FIELDS } from "./products";

/**
 * Everything the home page renders from the backend in ONE request: the
 * `tamarHomePage` field (plugin-side) returns wp-admin's home settings, the
 * three product rails (admin picks, else best sellers / newest / on sale,
 * decided in PHP), and just the categories/brands the sliders show. With the
 * layout's /global-data call that is the page's whole 2-call budget, with no
 * "fetch settings first, then query by ids" waterfall and no whole-catalogue
 * category/brand dump.
 */
export const GET_HOME_DATA = /* GraphQL */ `
  query GetHomeData {
    seo: tamarSeo(kind: "home") {
      ${SEO_FIELDS}
    }
    tamarHomePage {
      settings
      hotProducts {
        ${PRODUCT_LIST_FIELDS}
      }
      newProducts {
        ${PRODUCT_LIST_FIELDS}
      }
      saleProducts {
        ${PRODUCT_LIST_FIELDS}
      }
      # Only what the sliders render (admin picks, else top 10 / 20) — resolved in the plugin, not the whole catalogue.
      categories {
        id
        databaseId
        name
        slug
        count
        image {
          sourceUrl
        }
        parent {
          node {
            id
          }
        }
      }
      brands {
        id
        databaseId
        name
        slug
        thumbnailUrl
      }
    }
  }
`;
