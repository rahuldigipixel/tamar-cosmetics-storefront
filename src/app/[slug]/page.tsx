import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentPosts, getPostBySlug, getPostComments } from "@/lib/wpgraphql/posts";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogShare } from "@/components/blog/BlogShare";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { BlogComments } from "@/components/blog/BlogComments";
import { ProductSlider } from "@/components/home/ProductSlider";
import { wpEnv } from "@/lib/wpgraphql/env";
import { seoToMetadata, jsonLdString, absoluteUrl, toDescription } from "@/lib/seo";

export const revalidate = 300;

// Root-level path (no "/blog/" segment) to match the live site's real post
// permalinks, e.g. tamarcosmetics.co.il/איפור-לשבת/ — the list itself stays
// at /blog. Only matches when no other top-level route (about, shop, cart,
// product, …) already claims the segment, since Next resolves static
// routes before falling through to this dynamic one.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params;
 const post = await getPostBySlug(slug);
 if (!post) return { title: "העמוד לא נמצא", robots: { index: false, follow: false } };
 return {
 ...seoToMetadata(post.seo, {
 path: `/${post.slug}`,
 ogType: "article",
 fallback: { title: `${post.title} | תמר קוסמטיקס`, description: toDescription(post.excerpt), image: post.image?.url },
 }),
 };
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
 const articleLd = {
 "@context": "https://schema.org",
 "@type": "BlogPosting",
 headline: post.title,
 description: toDescription(post.excerpt),
 image: post.image?.url ? [post.image.url] : undefined,
 datePublished: post.date,
 dateModified: post.modified ?? post.date,
 author: { "@type": "Person", name: post.authorName ?? "תמר קוסמטיקס" },
 publisher: { "@type": "Organization", name: "תמר קוסמטיקס", logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo.png") } },
 mainEntityOfPage: absoluteUrl(`/${post.slug}`),
 inLanguage: "he-IL",
 };

 return (
 <article dir="rtl" className="mx-auto max-w-[1600px] px-[15px] py-8 sm:py-10">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(articleLd) }} />
 <div className="font-[family-name:Arial,Helvetica,sans-serif]">
 {post.category ? (
 <div className="mb-[15px] flex justify-center">
 <Link
 href={post.categorySlug ? `/category/${post.categorySlug}/` : "/blog/"}
 className="bg-[#d52027] px-[10px] text-[12px] font-semibold uppercase leading-[25px] text-white"
 >
 {post.category}
 </Link>
 </div>
 ) : null}

 <h1 className="mb-[10px] text-center text-[20px] font-normal leading-[28px] text-black lg:text-[32px] lg:leading-[38.4px]">{post.title}</h1>
 </div>

 <BlogContent html={post.contentHtml} altFallback={post.title} className="mt-[10px]" />

 {post.products.length > 0 ? (
 // Top gap from the post text; side padding keeps the arrows inside the content width.
 <div className="mt-10 md:mt-14 md:px-[45px]">
 <ProductSlider title={post.productsTitle} products={post.products} compact titleWeight="font-normal" />
 </div>
 ) : null}

 <div className="mt-10 flex justify-center border-t border-black/[0.105] py-5 lg:mt-[60px]">
 <BlogShare url={shareUrl} title={post.title} />
 </div>

 <BlogPostNav newer={newer} older={older} />

 <BlogComments postId={post.databaseId} initialComments={comments} />
 </article>
 );
}
