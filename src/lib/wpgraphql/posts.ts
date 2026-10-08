import { cache } from "react";
import type { Seo } from "@/lib/seo";
import { wpEnv } from "./env";
import { fetchGraphQLSafe } from "./client";
import { mapProductListNodes, type GqlProductNode } from "./products";
import type { Product } from "@/types/product";
import { GET_CATEGORY_BY_SLUG, GET_POSTS, GET_POSTS_BY_CATEGORY, GET_POST_BY_SLUG, GET_POST_NAV_LIST } from "./queries/posts";

const MAX_POST_PRODUCTS = 24;

export interface BlogPostSummary {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: { url: string; alt: string } | null;
  category: string | null;
  categorySlug: string | null;
}

export interface BlogPost extends BlogPostSummary {
  /** Rank Math SEO for this post (null if the plugin field is unavailable). */
  seo: Seo | null;
  modified: string | null;
  contentHtml: string;
  authorName: string | null;
  /** Products picked in the post's wp-admin edit screen, in the admin's order (empty when none). */
  products: Product[];
  /** Heading above the products slider; empty = no heading. */
  productsTitle: string;
}

interface GqlPostNode {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
  categories?: { nodes: { name: string; slug: string }[] } | null;
}

function toSummary(p: GqlPostNode): BlogPostSummary {
  return {
    id: p.id,
    databaseId: p.databaseId,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    image: p.featuredImage?.node ? { url: p.featuredImage.node.sourceUrl, alt: p.featuredImage.node.altText || p.title } : null,
    category: p.categories?.nodes[0]?.name ?? null,
    categorySlug: p.categories?.nodes[0]?.slug ?? null,
  };
}

export interface ListPostsResult {
  posts: BlogPostSummary[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export async function listPosts(params: { first?: number; after?: string | null } = {}): Promise<ListPostsResult> {
  const data = await fetchGraphQLSafe<{
    posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlPostNode[] };
  }>(
    GET_POSTS,
    { first: params.first ?? 9, after: params.after ?? null },
    { tags: ["posts"], revalidate: 300 }
  );

  if (!data?.posts) return { posts: [], hasNextPage: false, endCursor: null };

  return {
    posts: data.posts.nodes.map(toSummary),
    hasNextPage: data.posts.pageInfo.hasNextPage,
    endCursor: data.posts.pageInfo.endCursor,
  };
}

export async function listPostsByCategory(
  categorySlug: string,
  params: { first?: number; after?: string | null } = {}
): Promise<ListPostsResult> {
  const data = await fetchGraphQLSafe<{
    posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlPostNode[] };
  }>(
    GET_POSTS_BY_CATEGORY,
    { first: params.first ?? 9, after: params.after ?? null, categoryName: categorySlug },
    { tags: ["posts", `category:${categorySlug}`], revalidate: 300 }
  );

  if (!data?.posts) return { posts: [], hasNextPage: false, endCursor: null };

  return {
    posts: data.posts.nodes.map(toSummary),
    hasNextPage: data.posts.pageInfo.hasNextPage,
    endCursor: data.posts.pageInfo.endCursor,
  };
}

export interface BlogCategory {
  databaseId: number;
  name: string;
  slug: string;
}

export const getCategoryBySlug = cache(async (slug: string): Promise<BlogCategory | null> => {
  const queryableSlug = encodeURIComponent(decodeURIComponent(slug)).toLowerCase();
  const data = await fetchGraphQLSafe<{ category: BlogCategory | null }>(
    GET_CATEGORY_BY_SLUG,
    { slug: queryableSlug },
    { tags: ["posts", `category:${slug}`], revalidate: 300 }
  );
  return data?.category ?? null;
});

/**
 * Wrapped in React `cache()` because both generateMetadata() and the page
 * call it in the same render — GraphQL goes over POST, and Next only
 * auto-dedupes GET fetches, so without this every blog post hit the backend
 * twice for the same post (same fix already applied to getProductBySlug in
 * products.ts).
 */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  // This WP install's non-ASCII post slugs are stored in post_name as
  // lowercase percent-encoded UTF-8 (WordPress's own utf8_uri_encode(),
  // which — unlike encodeURIComponent — always lowercases the hex pairs).
  // Next's dynamic route param for a non-ASCII segment arrives here still
  // percent-encoded (uppercase, as the browser sent it) rather than decoded
  // — confirmed directly against this dev server. decodeURIComponent() first
  // normalizes that back to plain Hebrew (a no-op if it were ever already
  // decoded, or for a plain-ASCII slug like "hello-world"), then
  // re-encoding + lowercasing reproduces exactly the stored post_name form
  // `post(id, idType: SLUG)` needs to match.
  const queryableSlug = encodeURIComponent(decodeURIComponent(slug)).toLowerCase();

  const data = await fetchGraphQLSafe<{
    seo: Seo | null;
    post:
      | (GqlPostNode & {
          modified?: string | null;
          content: string;
          author?: { node: { name: string } } | null;
          tamarPostProducts?: GqlProductNode[] | null;
          tamarPostProductsTitle?: string | null;
        })
      | null;
  }>(GET_POST_BY_SLUG, { slug: queryableSlug, seoSlug: queryableSlug }, { tags: ["posts", `post:${slug}`], revalidate: 300 });

  if (!data?.post) return null;

  return {
    ...toSummary(data.post),
    seo: data.seo ?? null,
    modified: data.post.modified ?? null,
    contentHtml: data.post.content,
    authorName: data.post.author?.node.name ?? null,
    productsTitle: data.post.tamarPostProductsTitle?.trim() ?? "",
    // Cap the slider: one post had 100 picked products = a 4.6 MB page (every card renders 3x in the infinite carousel).
    products: await mapProductListNodes((data.post.tamarPostProducts ?? []).slice(0, MAX_POST_PRODUCTS)),
  };
});

export interface AdjacentPostLink {
  slug: string;
  title: string;
}

export interface AdjacentPosts {
  /** Published after the current post (comes first in the default date-DESC feed). */
  newer: AdjacentPostLink | null;
  /** Published before the current post. */
  older: AdjacentPostLink | null;
}

/**
 * A slug+title-only pass over (up to 100) posts, ordered the same as the
 * blog list's default feed, purely to find the two neighbors of the current
 * post for the prev/next links — far cheaper than fetching full post data
 * for candidates. Reuses the "posts" cache tag/interval since it's the same
 * underlying list.
 */
export async function getAdjacentPosts(currentSlug: string): Promise<AdjacentPosts> {
  const data = await fetchGraphQLSafe<{ posts: { nodes: { slug: string; title: string }[] } }>(
    GET_POST_NAV_LIST,
    {},
    { tags: ["posts"], revalidate: 300 }
  );

  const list = data?.posts?.nodes ?? [];
  // currentSlug arrives already normalized the same way as getPostBySlug's
  // queryableSlug (lowercase percent-encoded) — GraphQL's own `slug` field
  // is plain decoded text, so compare against the decoded form.
  const decodedSlug = decodeURIComponent(currentSlug);
  const index = list.findIndex((p) => p.slug === decodedSlug);
  if (index === -1) return { newer: null, older: null };

  return {
    newer: index > 0 ? list[index - 1] : null,
    older: index < list.length - 1 ? list[index + 1] : null,
  };
}

export interface BlogComment {
  id: number;
  authorName: string;
  date: string;
  contentHtml: string;
}

interface WpRestComment {
  id: number;
  author_name: string;
  date: string;
  content: { rendered: string };
}

const REST_TIMEOUT_MS = 10_000;

/**
 * Reading comments is a plain public WP REST call (only approved comments
 * are ever returned to an unauthenticated request) — no plugin endpoint
 * needed, unlike posting one (see class-blog.php on the WP side for why).
 */
export async function getPostComments(postId: number): Promise<BlogComment[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${wpEnv.wordpressUrl}/wp-json/wp/v2/comments?post=${postId}&order=asc&per_page=50&_fields=id,author_name,date,content`,
      { next: { tags: [`comments:${postId}`], revalidate: 60 }, signal: controller.signal }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as WpRestComment[];
    return data.map((c) => ({ id: c.id, authorName: c.author_name, date: c.date, contentHtml: c.content.rendered }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
