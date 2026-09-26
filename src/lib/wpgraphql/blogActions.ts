"use server";

import { listPosts, type ListPostsResult } from "./posts";

/** Powers the blog list's "load more" button — see BlogLoadMore.tsx. */
export async function fetchMorePosts(after: string | null): Promise<ListPostsResult> {
  return listPosts({ after, first: 9 });
}
