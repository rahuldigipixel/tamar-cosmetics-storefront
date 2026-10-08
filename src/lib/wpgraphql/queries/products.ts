import { SEO_FIELDS } from "@/lib/seo";
/**
 * Only what a product card renders (ProductGridCard / ProductCard /
 * SaleShowcase) — list views are 20-60 products per
 * page and every node is also serialized into the RSC payload, so
 * description/attributes/variations here used to cost MBs of HTML for
 * fields no card reads. `__typename` gives simple-vs-variable without
 * pulling the variations list. Anything the single-product page needs goes
 * in PRODUCT_DETAIL_FIELDS instead.
 */
// Repeated verbatim inside both type fragments below (rather than once at
// the top level) because this fragment is also spread under the `related`
// field (see GET_PRODUCT_BY_SLUG), which resolves to ProductUnion — a plain
// union with no shared fields beyond __typename/id/databaseId/slug/name.
// `products.nodes` resolves to the Product interface instead, where these
// would work unconditionally, but duplicating them into each `... on`
// fragment keeps one query shape that's valid in both places.
const PRODUCT_CARD_SHARED_FIELDS = /* GraphQL */ `
  averageRating
  reviewCount
  image {
    id
    sourceUrl
    altText
  }
  productCategories {
    nodes {
      id
      name
      slug
    }
  }
  allPaBrand {
    nodes {
      name
      thumbnailUrl
    }
  }
  galleryFirstImage: galleryImages(first: 1) {
    nodes {
      id
      sourceUrl
      altText
    }
  }
  # Rendered Advanced Product Labels (wp-admin → BeRocket → Advanced Labels) — which products get one is decided there.
  tamarLabels {
    image
    label
  }
  # Unit price after YITH Dynamic Pricing rules (null when none applies).
  tamarDynamicPrice
`;

export const PRODUCT_LIST_FIELDS = /* GraphQL */ `
  __typename
  id
  databaseId
  slug
  name
  # related/upsell nodes are a ProductUnion, so the field needs a type condition.
  ... on Product {
    tamarCoupon {
      code
      label
    }
  }
  ... on SimpleProduct {
    sku
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
    ${PRODUCT_CARD_SHARED_FIELDS}
  }
  ... on VariableProduct {
    sku
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
    ${PRODUCT_CARD_SHARED_FIELDS}
  }
`;

// `barcode` / `tip_description` ("Tamar Tip") are the ACF meta keys shown on the product page. Global attribute
// options come back as raw term slugs, so `terms` supplies the display names.
const DETAIL_BARCODE_AND_ATTRIBUTES = /* GraphQL */ `
  barcode: metaData(keysIn: ["barcode"]) {
    value
  }
  tip: metaData(keysIn: ["tip_description"]) {
    value
  }
  tamarCoupon {
    code
    label
  }
  # Products picked in the product edit screen (_single_product_slider_ids) — vertical slider above the tip.
  tamarSliderProducts {
    databaseId
    slug
    name
    sku
    price
    regularPrice
    salePrice
    onSale
    inStock
    purchasable
    averageRating
    reviewCount
    image {
      url
      width
      height
      alt
    }
  }
  # YITH Tab Manager tabs with content for this product (empty tabs already omitted by the backend).
  tamarTabs {
    id
    title
    content
  }
  attributes {
    nodes {
      id
      name
      label
      options
      variation
      ... on GlobalProductAttribute {
        terms {
          nodes {
            name
            slug
            tamarImageUrl
            tamarTermHint
            tamarBrandDescription
          }
        }
      }
    }
  }
`;

const PRODUCT_DETAIL_FIELDS = /* GraphQL */ `
  __typename
  id
  databaseId
  slug
  name
  averageRating
  reviewCount
  ... on SimpleProduct {
    sku
    shortDescription
    description
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
    weight
    ${DETAIL_BARCODE_AND_ATTRIBUTES}
  }
  ... on VariableProduct {
    sku
    shortDescription
    description
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
    weight
    ${DETAIL_BARCODE_AND_ATTRIBUTES}
  }
  image {
    id
    sourceUrl
    altText
  }
  tamarLabels {
    image
    label
  }
  tamarDynamicPrice
  galleryImages {
    nodes {
      id
      sourceUrl
      altText
    }
  }
  productCategories {
    nodes {
      id
      name
      slug
      parent {
        node {
          id
          name
          slug
        }
      }
    }
  }
  allPaBrand {
    nodes {
      name
      thumbnailUrl
    }
  }
`;
// `variations` is intentionally not requested: nothing on the product page
// renders them yet (ProductPurchasePanel only takes productId). Add a
// `variations { nodes { ... } }` block under `... on VariableProduct` when a
// variation picker is built — fromGraphqlProduct() already maps it.

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts(
    $first: Int = 24
    $after: String
    $category: [String]
    $brand: [String]
    $country: [String]
    $search: String
    $orderby: [ProductsOrderbyInput]
    $minPrice: Float
    $maxPrice: Float
    $onSale: Boolean
  ) {
    products(
      first: $first
      after: $after
      where: {
        categoryIn: $category
        taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $brand }, { taxonomy: PA_COUNTRY, terms: $country }] }
        search: $search
        status: "publish"
        orderby: $orderby
        minPrice: $minPrice
        maxPrice: $maxPrice
        onSale: $onSale
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = /* GraphQL */ `
  query GetProductBySlug($slug: ID!, $seoSlug: String, $relatedFirst: Int = 13) {
    seo: tamarSeo(kind: "product", slug: $seoSlug) {
      ${SEO_FIELDS}
    }
    product(id: $slug, idType: SLUG) {
      ${PRODUCT_DETAIL_FIELDS}
      upsell(first: $relatedFirst) {
        nodes {
          ${PRODUCT_LIST_FIELDS}
        }
      }
      related(first: $relatedFirst) {
        nodes {
          ${PRODUCT_LIST_FIELDS}
        }
      }
    }
    # Admin-managed icon boxes (wp-admin → Single Product Settings) — folded in here to keep the page at 2 backend calls.
    pageSettings: tamarProductPageSettings {
      shippingReturns
      visibility {
        tip
        iconBoxes
        barcode
        coupon
        share
        unitPrice
        iconStrip
        complementary
        similar
        upsells
        related
        brandTip
        aboutBrandTab
        shippingTab
      }
      iconStrip {
        title
        link
        image {
          url
          width
          height
          alt
        }
      }
      features {
        iconType
        icon
        iconImage {
          url
          width
          height
          alt
        }
        title
        subtitle
        link
      }
    }
  }
`;

/** Several products by database id in one round trip (e.g. the wishlist page) — card fields only. */
export const GET_PRODUCTS_BY_IDS = /* GraphQL */ `
  query GetProductsByIds($ids: [Int], $first: Int) {
    products(first: $first, where: { include: $ids, status: "publish" }) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
    }
  }
`;

const QUICK_VIEW_TYPE_FIELDS = /* GraphQL */ `
  sku
  shortDescription
  onSale
  price(format: RAW)
  regularPrice(format: RAW)
  salePrice(format: RAW)
  stockStatus
`;

/** Quick-view popup: only what the popup renders, fetched on demand when it opens (never on page load). */
export const GET_PRODUCT_QUICK_VIEW = /* GraphQL */ `
  query GetProductQuickView($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      __typename
      id
      databaseId
      slug
      name
      ... on SimpleProduct {
        ${QUICK_VIEW_TYPE_FIELDS}
      }
      ... on VariableProduct {
        ${QUICK_VIEW_TYPE_FIELDS}
      }
      image {
        id
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          id
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          id
          name
          slug
        }
      }
      allPaBrand {
        nodes {
          name
          thumbnailUrl
        }
      }
    }
  }
`;
