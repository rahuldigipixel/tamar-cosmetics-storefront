import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAdjacentPosts, getPostBySlug, getPostComments } from "@/lib/wpgraphql/posts";
import { formatDate } from "@/lib/utils/formatDate";
import { RichContent } from "@/components/ui/RichContent";
import { SocialShare } from "@/components/product/SocialShare";
import { BlogComments } from "@/components/blog/BlogComments";
import { wpEnv } from "@/lib/wpgraphql/env";

export const revalidate = 300;

// Root-level path (no "/blog/" segment) to match the live site's real post
// permalinks, e.g. tamarcosmetics.co.il/איפור-לשבת/ — the list itself stays
// at /blog. Only matches when no other top-level route (about, shop, cart,
// product, …) already claims the segment, since Next resolves static
// routes before falling through to this dynamic one.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params;
 const post = await getPostBySlug(slug);
 if (!post) return {};
 return { title: post.title };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const post = await getPostBySlug(slug);
 if (!post) notFound();

 const [{ newer, older }, comments] = await Promise.all([
 getAdjacentPosts(slug),
 getPostComments(post.databaseId),
 ]);

 const shareUrl = `${wpEnv.siteUrl}/${post.slug}/`;

 return (
 <article className="mx-auto max-w-[1600px] px-[15px] py-8 sm:py-10">
 <Link href="/blog/" className="group inline-flex items-center gap-1 text-base font-semibold text-brand-accent">
 <ChevronLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-0.5" />
 חזרה למגזין
 </Link>

 <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>

 <div className="mt-3 flex items-center gap-2 text-base text-black/50">
 <span>{formatDate(post.date)}</span>
 {post.authorName ? (
 <>
 <span aria-hidden>&middot;</span>
 <span>{post.authorName}</span>
 </>
 ) : null}
 </div>

 {post.image ? (
 <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-brand-soft/30">
 <Image src={post.image.url} alt={post.image.alt} fill sizes="(min-width: 1400px) 1400px, 100vw" className="object-cover" priority />
 </div>
 ) : null}

 <RichContent html={post.contentHtml} className="mt-8" />

 <div className="mt-10 flex justify-center border-t border-black/10 pt-8">
 <SocialShare url={shareUrl} title={post.title} />
 </div>

 {newer || older ? (
 <div className="mt-8 grid grid-cols-1 gap-3 border-t border-black/10 pt-8 sm:grid-cols-2">
 {older ? (
 <Link
 href={`/${older.slug}/`}
 className="group flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-4 text-right shadow-sm transition-shadow hover:shadow-md"
 >
 <span className="flex items-center gap-1 text-sm font-semibold text-black/40">
 <ChevronRight className="h-3.5 w-3.5" />
 ישן יותר
 </span>
 <span className="line-clamp-2 font-semibold text-black/85 group-hover:text-brand-accent">{older.title}</span>
 </Link>
 ) : (
 <div />
 )}
 {newer ? (
 <Link
 href={`/${newer.slug}/`}
 className="group flex flex-col items-end gap-1 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md sm:text-right"
 >
 <span className="flex items-center gap-1 text-sm font-semibold text-black/40">
 חדש יותר
 <ChevronLeft className="h-3.5 w-3.5" />
 </span>
 <span className="line-clamp-2 font-semibold text-black/85 group-hover:text-brand-accent">{newer.title}</span>
 </Link>
 ) : null}
 </div>
 ) : null}

 <BlogComments postId={post.databaseId} initialComments={comments} />
 </article>
 );
}
