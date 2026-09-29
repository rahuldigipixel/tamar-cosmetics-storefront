import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listPostsByCategory } from "@/lib/wpgraphql/posts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogInfiniteScroll } from "@/components/blog/BlogInfiniteScroll";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { posts, hasNextPage, endCursor } = await listPostsByCategory(category.slug, { first: 9 });

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
          <span className="inline-block rounded-full bg-brand-accent px-5 py-2 text-base font-semibold text-white">
            {category.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-[15px] py-10">
        {posts.length === 0 ? (
          <p className="text-center text-black/60">אין עדיין מאמרים בקטגוריה זו.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <BlogInfiniteScroll initialEndCursor={endCursor} initialHasNextPage={hasNextPage} categorySlug={category.slug} />
      </div>
    </div>
  );
}
