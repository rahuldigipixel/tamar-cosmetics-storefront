import type { MetadataRoute } from "next";
import { fetchGraphQLSafe } from "@/lib/wpgraphql/client";
import { absoluteUrl, PUBLIC_PATHS, SITEMAP_STATIC_ROUTES } from "@/lib/seo";

// Regenerated at most hourly — the sitemap is fetched by crawlers, never on a shopper's page load.
export const revalidate = 3600;

const PAGE_SIZE = 100; // WPGraphQL's per-request cap
const MAX_PRODUCT_PAGES = 100;

const PRODUCTS_QUERY = /* GraphQL */ `
  query SitemapProducts($after: String) {
    products(first: ${PAGE_SIZE}, after: $after, where: { status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        modified
      }
    }
  }
`;

const TAXONOMIES_QUERY = /* GraphQL */ `
  query SitemapTaxonomies {
    productCategories(first: 500, where: { hideEmpty: true }) {
      nodes {
        slug
        ancestors {
          nodes {
            slug
          }
        }
      }
    }
    allPaBrand(first: 500, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;

const POSTS_QUERY = /* GraphQL */ `
  query SitemapPosts($after: String) {
    posts(first: ${PAGE_SIZE}, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        modified
      }
    }
  }
`;

interface PostsPage {
  posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: { slug: string; modified?: string | null }[] };
}

interface ProductsPage {
  products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: { slug: string; modified?: string | null }[] };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opts = { tags: ["sitemap", "products"], revalidate: 3600 };

  const taxonomies = await fetchGraphQLSafe<{
    productCategories: { nodes: { slug: string; ancestors?: { nodes: { slug: string }[] } | null }[] };
    allPaBrand: { nodes: { slug: string }[] };
  }>(TAXONOMIES_QUERY, undefined, opts);

  const products: { slug: string; modified?: string | null }[] = [];
  let after: string | null = null;
  for (let i = 0; i < MAX_PRODUCT_PAGES; i++) {
    const page: ProductsPage | null = await fetchGraphQLSafe<ProductsPage>(PRODUCTS_QUERY, { after }, opts);
    if (!page) break;
    products.push(...page.products.nodes);
    if (!page.products.pageInfo.hasNextPage) break;
    after = page.products.pageInfo.endCursor;
  }

  const posts: { slug: string; modified?: string | null }[] = [];
  let postAfter: string | null = null;
  for (let i = 0; i < 20; i++) {
    const page: PostsPage | null = await fetchGraphQLSafe<PostsPage>(POSTS_QUERY, { after: postAfter }, opts);
    if (!page) break;
    posts.push(...page.posts.nodes);
    if (!page.posts.pageInfo.hasNextPage) break;
    postAfter = page.posts.pageInfo.endCursor;
  }

  const categoryUrls = (taxonomies?.productCategories.nodes ?? []).map((c) => {
    // WPGraphQL lists ancestors nearest-first; the URL path is root → leaf.
    const path = [...(c.ancestors?.nodes ?? []).map((a) => a.slug).reverse(), c.slug].join("/");
    return { url: absoluteUrl(`/product-category/${path}/`) };
  });

  const brandUrls = (taxonomies?.allPaBrand.nodes ?? []).map((b) => ({
    url: absoluteUrl(`/brand/${b.slug}/`),
  }));

  const productUrls = products.map((p) => ({
    url: absoluteUrl(`/product/${p.slug}`),
    lastModified: p.modified ? new Date(p.modified) : undefined,
  }));

  const postUrls = posts.map((p) => ({
    url: absoluteUrl(`/${p.slug}`),
    lastModified: p.modified ? new Date(p.modified) : undefined,
  }));

  // Static / wp-admin pages, under the public (legacy) path that Google has indexed.
  const staticUrls = SITEMAP_STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(PUBLIC_PATHS[route] ?? route),
  }));

  return [
    { url: absoluteUrl("/") },
    ...staticUrls,
    ...postUrls,
    ...categoryUrls,
    ...brandUrls,
    ...productUrls,
  ];
}
