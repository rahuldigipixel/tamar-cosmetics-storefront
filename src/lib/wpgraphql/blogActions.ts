"use server";

import { listPosts, listPostsByCategory, type ListPostsResult } from "./posts";

/** Powers the blog list's "load more" button — see BlogLoadMore.tsx. */
export async function fetchMorePosts(after: string | null): Promise<ListPostsResult> {
  return listPosts({ after, first: 9 });
}

/** Same as fetchMorePosts, scoped to one category — see BlogInfiniteScroll.tsx. */
export async function fetchMoreCategoryPosts(categorySlug: string, after: string | null): Promise<ListPostsResult> {
  return listPostsByCategory(categorySlug, { after, first: 9 });
}
