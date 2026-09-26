import type { Metadata } from "next";
import { listPosts } from "@/lib/wpgraphql/posts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogInfiniteScroll } from "@/components/blog/BlogInfiniteScroll";

export const revalidate = 300;

export const metadata: Metadata = { title: "מגזין תמר קוסמטיקס" };

export default async function BlogPage() {
 const { posts, hasNextPage, endCursor } = await listPosts({ first: 9 });

 return (
 <div>
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">מגזין תמר קוסמטיקס</h1>
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 {posts.length === 0 ? (
 <p className="text-center text-black/60">אין עדיין מאמרים.</p>
 ) : (
 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {posts.map((post) => (
 <BlogPostCard key={post.id} post={post} />
 ))}
 </div>
 )}

 <BlogInfiniteScroll initialEndCursor={endCursor} initialHasNextPage={hasNextPage} />
 </div>
 </div>
 );
}
