"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BlogPostCard } from "./BlogPostCard";
import { fetchMorePosts } from "@/lib/wpgraphql/blogActions";
import type { BlogPostSummary } from "@/lib/wpgraphql/posts";

/**
 * Loads more posts automatically as the sentinel below the grid scrolls
 * into view — same IntersectionObserver pattern as the shop/category grid
 * (see CategoryProductGrid.tsx) — instead of a "load more" click.
 */
export function BlogInfiniteScroll({
  initialEndCursor,
  initialHasNextPage,
}: {
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
}) {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isPending) {
          startTransition(async () => {
            const result = await fetchMorePosts(endCursor);
            setPosts((prev) => [...prev, ...result.posts]);
            setEndCursor(result.endCursor);
            setHasNextPage(result.hasNextPage);
          });
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isPending, endCursor]);

  return (
    <>
      {posts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}

      {hasNextPage ? (
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {isPending ? (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-soft border-t-brand-accent" />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
