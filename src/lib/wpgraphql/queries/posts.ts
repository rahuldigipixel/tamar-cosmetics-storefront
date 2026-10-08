import { SEO_FIELDS } from "@/lib/seo";
import { PRODUCT_LIST_FIELDS } from "./products";

export const GET_POSTS =/* GraphQL */ `
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
            slug
          }
        }
      }
    }
  }
`;

// Same shape as GET_POSTS, filtered to one category — powers /category/[slug].
export const GET_POSTS_BY_CATEGORY = /* GraphQL */ `
  query GetPostsByCategory($first: Int!, $after: String, $categoryName: String!) {
    posts(
      first: $first
      after: $after
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC }, categoryName: $categoryName }
    ) {
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
            slug
          }
        }
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = /* GraphQL */ `
  query GetCategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      databaseId
      name
      slug
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

// tamarPostProducts = products picked in the post edit screen (plugin class-blog.php), folded into this one query.
export const GET_POST_BY_SLUG = /* GraphQL */ `
  query GetPostBySlug($slug: ID!, $seoSlug: String) {
    seo: tamarSeo(kind: "post", slug: $seoSlug) {
      ${SEO_FIELDS}
    }
    post(id: $slug, idType: SLUG) {
      modified
      tamarPostProductsTitle
      tamarPostProducts {
        ${PRODUCT_LIST_FIELDS}
      }
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
      categories(first: 1) {
        nodes {
          name
          slug
        }
      }
    }
  }
`;
