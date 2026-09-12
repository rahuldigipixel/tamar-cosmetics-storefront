const PRODUCT_CORE_FIELDS = /* GraphQL */ `
  id
  databaseId
  slug
  name
  averageRating
  reviewCount
  productBrands {
    nodes {
      name
      slug
    }
  }
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
    variations(first: 50) {
      nodes {
        id
        databaseId
        name
        price(format: RAW)
        regularPrice(format: RAW)
        salePrice(format: RAW)
        stockStatus
        attributes {
          nodes {
            name
            value
          }
        }
        image {
          id
          sourceUrl
          altText
        }
      }
    }
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
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts(
    $first: Int = 24
    $after: String
    $category: [String]
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
        ${PRODUCT_CORE_FIELDS}
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = /* GraphQL */ `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ${PRODUCT_CORE_FIELDS}
      galleryImages {
        nodes {
          id
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_DATABASE_ID = /* GraphQL */ `
  query GetProductByDatabaseId($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      ${PRODUCT_CORE_FIELDS}
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
