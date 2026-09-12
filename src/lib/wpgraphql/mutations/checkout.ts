/**
 * `appartment` on CustomerAddressInput is a custom field added by the
 * tamar-graphql-checkout plugin (WooGraphQL's CustomerAddressInput doesn't
 * have it natively) — it writes through to order/customer meta as
 * `_billing_appartment` / `billing_appartment`, the same keys the classic
 * checkout (wps-woo-extended) and DataLogics/Chita's hooks already use.
 *
 * City has no dedicated field here: "Cities Shipping Zones for WooCommerce"
 * repurposes `billing_state` to hold the city name on this site, so city
 * values are sent through CustomerAddressInput's `state` field.
 */
export const CHECKOUT = /* GraphQL */ `
  mutation Checkout(
    $billing: CustomerAddressInput!
    $shipping: CustomerAddressInput!
    $paymentMethod: String!
    $customerNote: String
  ) {
    checkout(
      input: {
        billing: $billing
        shipping: $shipping
        paymentMethod: $paymentMethod
        customerNote: $customerNote
        isPaid: false
      }
    ) {
      order {
        id
        databaseId
        orderKey
        status
        total
      }
      result
      redirect
    }
  }
`;
