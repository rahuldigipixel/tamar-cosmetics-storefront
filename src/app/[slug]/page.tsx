import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getAdjacentPosts, getPostBySlug, getPostComments } from "@/lib/wpgraphql/posts";
import { RichContent } from "@/components/ui/RichContent";
import { BlogShare } from "@/components/blog/BlogShare";
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
 <article dir="rtl" className="mx-auto max-w-[1600px] px-[15px] py-8 sm:py-10">
 {post.category ? (
 <div className="flex justify-center">
 <Link
 href={post.categorySlug ? `/category/${post.categorySlug}/` : "/blog/"}
 className="rounded-full bg-brand-accent px-5 py-2 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
 >
 {post.category}
 </Link>
 </div>
 ) : null}

 <h1 className="mt-4 text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>

 {post.image ? (
 <div className="relative mx-auto mt-6 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl bg-brand-soft/30">
 <Image src={post.image.url} alt={post.image.alt} fill sizes="(min-width: 768px) 576px, 100vw" className="object-cover" priority />
 </div>
 ) : null}

 <RichContent html={post.contentHtml} className="mt-8" />

 <div className="mt-10 flex justify-center border-t border-black/10 pt-8">
 <BlogShare url={shareUrl} title={post.title} />
 </div>

 {newer || older ? (
 <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-black/10 pt-8">
 {older ? (
 <Link href={`/${older.slug}/`} className="group flex flex-col gap-1 text-right">
 <span className="flex items-center gap-1 text-sm font-semibold text-black/40">
 <ChevronRight className="h-3.5 w-3.5" />
 ישן יותר
 </span>
 <span className="line-clamp-2 font-semibold text-black/85 group-hover:text-brand-accent">{older.title}</span>
 </Link>
 ) : (
 <div />
 )}

 <Link
 href="/blog/"
 aria-label="כל המאמרים"
 className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:border-brand-accent hover:text-brand-accent"
 >
 <LayoutGrid className="h-5 w-5" />
 </Link>

 {newer ? (
 <Link href={`/${newer.slug}/`} className="group flex flex-col items-end gap-1 text-left">
 <span className="flex items-center gap-1 text-sm font-semibold text-black/40">
 חדש יותר
 <ChevronLeft className="h-3.5 w-3.5" />
 </span>
 <span className="line-clamp-2 font-semibold text-black/85 group-hover:text-brand-accent">{newer.title}</span>
 </Link>
 ) : (
 <div />
 )}
 </div>
 ) : null}

 <BlogComments postId={post.databaseId} initialComments={comments} />
 </article>
 );
}
