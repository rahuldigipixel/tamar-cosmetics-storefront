export const GET_CATEGORIES = /* GraphQL */ `
  query GetCategories {
    productCategories(first: 150, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        count
        description
        image {
          sourceUrl
          altText
        }
        parent {
          node {
            id
          }
        }
      }
    }
  }
`;
