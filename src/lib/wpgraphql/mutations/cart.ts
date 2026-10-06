const CART_FIELDS = /* GraphQL */ `
  chosenShippingMethods
  isEmpty
  availableShippingMethods {
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
      total(format: RAW)
      subtotal(format: RAW)
      product {
        node {
          id
          databaseId
          slug
          name
          sku
          ... on SimpleProduct {
            regularPrice(format: RAW)
          }
          ... on VariableProduct {
            regularPrice(format: RAW)
          }
          productCategories {
            nodes {
              slug
            }
          }
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
          regularPrice(format: RAW)
        }
      }
    }
  }
  appliedCoupons {
    code
    discountAmount
  }
  subtotal(format: RAW)
  total(format: RAW)
  totalTax(format: RAW)
  shippingTotal(format: RAW)
  discountTotal(format: RAW)
`;

export const GET_CART = /* GraphQL */ `
  query GetCart {
    cart {
      ${CART_FIELDS}
    }
    customer {
      shipping {
        state
        city
      }
    }
  }
`;

/**
 * Checkout variant of GetCart: the same single request also returns the payment gateways WooCommerce
 * offers for this session (availability depends on the cart / chosen shipping), so /checkout needs no extra call.
 */
export const GET_CHECKOUT_CART = /* GraphQL */ `
  query GetCheckoutCart {
    cart {
      ${CART_FIELDS}
    }
    customer {
      shipping {
        state
        city
      }
    }
    paymentGateways {
      nodes {
        id
        title
        description
        icon
      }
    }
  }
`;

/** Sets the session customer's shipping destination; WooCommerce then re-evaluates the shipping zones. */
export function updateCustomerShippingMutation(state: string, city: string) {
  return /* GraphQL */ `
    mutation UpdateCustomerShipping {
      updateCustomer(input: { shipping: { country: IL, state: ${JSON.stringify(state)}, city: ${JSON.stringify(city)} } }) {
        customer {
          shipping {
            state
            city
          }
        }
      }
    }
  `;
}

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

export const UPDATE_SHIPPING_METHOD = /* GraphQL */ `
  mutation UpdateShippingMethod($shippingMethods: [String]) {
    updateShippingMethod(input: { shippingMethods: $shippingMethods }) {
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
