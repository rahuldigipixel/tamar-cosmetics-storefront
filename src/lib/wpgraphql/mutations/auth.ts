export const LOGIN = /* GraphQL */ `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      customer {
        id
        databaseId
        email
        firstName
        lastName
      }
    }
  }
`;

export const REGISTER_CUSTOMER = /* GraphQL */ `
  mutation RegisterCustomer($email: String!, $password: String!, $firstName: String, $lastName: String) {
    registerCustomer(
      input: { email: $email, password: $password, firstName: $firstName, lastName: $lastName }
    ) {
      authToken
      refreshToken
      customer {
        id
        databaseId
        email
        firstName
        lastName
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
