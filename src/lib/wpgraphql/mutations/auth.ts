// NOTE on `login`: WPGraphQL has no `login` mutation on this backend (no JWT
// Authentication plugin installed — confirmed by probing the schema: a
// `login` mutation returns "Cannot query field \"login\" on type
// \"RootMutation\"", and there's no authToken/refreshToken field anywhere in
// the schema either). Real customer login therefore needs a backend change
// (either installing a JWT/session auth plugin, or a custom REST endpoint in
// the tamar-headless-api plugin) before it can be wired here.
//
// registerCustomer / sendPasswordResetEmail / resetUserPassword are all
// native WPGraphQL core mutations that already work against this backend
// as-is — confirmed by the same probing.

export const REGISTER_CUSTOMER = /* GraphQL */ `
  mutation RegisterCustomer($username: String!, $email: String!, $password: String!) {
    registerCustomer(input: { username: $username, email: $email, password: $password }) {
      customer {
        id
        databaseId
        email
        username
      }
    }
  }
`;

export const SEND_PASSWORD_RESET_EMAIL = /* GraphQL */ `
  mutation SendPasswordResetEmail($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      success
    }
  }
`;

export const RESET_USER_PASSWORD = /* GraphQL */ `
  mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: { key: $key, login: $login, password: $password }) {
      user {
        id
        databaseId
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS = /* GraphQL */ `
  query GetCustomerOrders($customerId: Int!) {
    customer(customerId: $customerId) {
      orders {
        nodes {
          id
          databaseId
          orderNumber
          date
          status
          total
          lineItems {
            nodes {
              product {
                node {
                  name
                }
              }
              quantity
              total
            }
          }
        }
      }
    }
  }
`;
