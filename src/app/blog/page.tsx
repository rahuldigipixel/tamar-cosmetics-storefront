import { listPosts } from "@/lib/wpgraphql/posts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogInfiniteScroll } from "@/components/blog/BlogInfiniteScroll";

export const revalidate = 300;

 
export default async function BlogPage() {
 const { posts, hasNextPage, endCursor } = await listPosts({ first: 9 });

 return (
 <div>
 

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 {posts.length === 0 ? (
 <p className="text-center text-black/60">אין עדיין מאמרים.</p>
 ) : (
 <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
