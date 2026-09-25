/**
 * Only what a product card renders (ProductGridCard / ProductCard /
 * SaleShowcase / SaleProductSlider) — list views are 20-60 products per
 * page and every node is also serialized into the RSC payload, so
 * description/attributes/variations here used to cost MBs of HTML for
 * fields no card reads. `__typename` gives simple-vs-variable without
 * pulling the variations list. Anything the single-product page needs goes
 * in PRODUCT_DETAIL_FIELDS instead.
 */
const PRODUCT_LIST_FIELDS = /* GraphQL */ `
  __typename
  id
  databaseId
  slug
  name
  ... on SimpleProduct {
    sku
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
  }
  ... on VariableProduct {
    sku
    onSale
    price(format: RAW)
    regularPrice(format: RAW)
    salePrice(format: RAW)
    stockStatus
  }
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
    attributes {
      nodes {
        id
        name
        label
        options
        variation
      }
    }
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
    attributes {
      nodes {
        id
        name
        label
        options
        variation
      }
    }
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
        taxonomyFilter: { filters: [{ taxonomy: PA_BRAND, terms: $brand }] }
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
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ${PRODUCT_DETAIL_FIELDS}
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

export const GET_PRODUCT_SLUGS = /* GraphQL */ `
  query GetProductSlugs($first: Int = 200) {
    products(first: $first, where: { status: "publish" }) {
      nodes {
        slug
      }
    }
  }
`;
