export const GET_POSTS = /* GraphQL */ `
  query GetPosts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories(first: 1) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

// slug+title only — used just to find a post's prev/next neighbors (see
// getAdjacentPosts()), not to render anything itself. Same order as
// GET_POSTS so "newer"/"older" line up with the list the user actually sees.
export const GET_POST_NAV_LIST = /* GraphQL */ `
  query GetPostNavList {
    posts(first: 100, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
        title
      }
    }
  }
`;

export const GET_POST_BY_SLUG = /* GraphQL */ `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      date
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      author {
        node {
          name
        }
      }
    }
  }
`;
