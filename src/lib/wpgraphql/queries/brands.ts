/** Card/filter fields only — /מותג/ grid and the category page's brand filter. */
const BRAND_LIST_FIELDS = /* GraphQL */ `
  id
  databaseId
  name
  slug
  thumbnailUrl
`;

/** Everything the single brand page renders (banners, extra description). */
const BRAND_DETAIL_FIELDS = /* GraphQL */ `
  ${BRAND_LIST_FIELDS}
  count
  description
  desktopBannerUrl
  mobileBannerUrl
  extraDescription
`;

// hideEmpty relies on the term's "count" meta, which is stale for most
// pa_brand terms here (bulk-assigned outside the normal WooCommerce admin
// flow that keeps it in sync) — fetch every term regardless and let callers
// verify real product membership themselves (see listBrandSlugsInCategory).
export const GET_BRANDS = /* GraphQL */ `
  query GetBrands {
    allPaBrand(first: 200, where: { hideEmpty: false }) {
      nodes {
        ${BRAND_LIST_FIELDS}
      }
    }
  }
`;

export const GET_BRAND_BY_SLUG = /* GraphQL */ `
  query GetBrandBySlug($slug: ID!) {
    paBrand(id: $slug, idType: SLUG) {
      ${BRAND_DETAIL_FIELDS}
    }
  }
`;
