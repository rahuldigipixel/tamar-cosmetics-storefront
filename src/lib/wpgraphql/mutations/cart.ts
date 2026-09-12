const CART_FIELDS = /* GraphQL */ `
  chosenShippingMethods
  isEmpty
  needsShippingAddress
  availableShippingMethods {
    packageDetails
    rates {
      id
      label
      cost
    }
  }
  contents {
    itemCount
    nodes {
      key
      quantity
      total
      subtotal
      product {
        node {
          id
          databaseId
          slug
          name
          image {
            sourceUrl
            altText
          }
        }
      }
      variation {
        node {
          id
          databaseId
          name
        }
      }
    }
  }
  appliedCoupons {
    code
    discountAmount
  }
  subtotal
  total
  totalTax
  shippingTotal
  discountTotal
`;

export const GET_CART = /* GraphQL */ `
  query GetCart {
    cart {
      ${CART_FIELDS}
    }
  }
`;

export const ADD_TO_CART = /* GraphQL */ `
  mutation AddToCart($productId: Int!, $variationId: Int, $quantity: Int!) {
    addToCart(
      input: { productId: $productId, variationId: $variationId, quantity: $quantity }
    ) {
      cart {
        ${CART_FIELDS}
      }
    }
  }
`;

export const UPDATE_CART_ITEM_QUANTITIES = /* GraphQL */ `
  mutation UpdateCartItemQuantities($items: [CartItemQuantityInput]!) {
    updateItemQuantities(input: { items: $items }) {
      cart {
        ${CART_FIELDS}
      }
    }
  }
`;

export const REMOVE_CART_ITEMS = /* GraphQL */ `
  mutation RemoveCartItems($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        ${CART_FIELDS}
      }
    }
  }
`;

export const APPLY_COUPON = /* GraphQL */ `
  mutation ApplyCoupon($code: String!) {
    applyCoupon(input: { code: $code }) {
      cart {
        ${CART_FIELDS}
      }
    }
  }
`;

export const REMOVE_COUPON = /* GraphQL */ `
  mutation RemoveCoupon($codes: [String]!) {
    removeCoupons(input: { codes: $codes }) {
      cart {
        ${CART_FIELDS}
      }
    }
  }
`;
