import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/wpgraphql/posts";

// WPGraphQL's `excerpt` is real HTML (a <p> plus a "Continue reading" link
// WordPress appends automatically) — strip tags for the plain-text preview
// shown on the card; the single post page renders the full `content` HTML
// as-is via RichContent instead.
function plainExcerpt(html: string): string {
  return html
    .replace(/<a[^>]*class=["']?more-link["']?[^>]*>.*?<\/a>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Sizes/colors measured from the legacy blog card (tamarcosmetics.co.il/blog)
 * at the user's explicit request: square corners, 0 0 4px rgba(0,0,0,.12)
 * shadow, 3:2 image, red 12px/600 category chip straddling the image edge,
 * centered Arial text (24px/20px title, 18px/21px excerpt, 13px/800 read-more).
 */
export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/${post.slug}/`}
      className="group flex flex-col bg-white font-[family-name:Arial,Helvetica,sans-serif] shadow-[0_0_4px_rgba(0,0,0,0.12)]"
    >
      <div className="relative">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-brand-soft/30">
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center gap-[7px] bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="h-[10px] w-[10px] rounded-full bg-white" />
            <span className="h-[10px] w-[10px] rounded-full bg-white" />
            <span className="h-[10px] w-[10px] rounded-full bg-white" />
          </div>
        </div>
        {post.category ? (
          <div className="absolute inset-x-[15px] bottom-0 z-10 flex translate-y-[12px] justify-center">
            <span className="bg-[#d52027] px-[10px] text-[12px] font-semibold uppercase leading-[25px] text-white">
              {post.category}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col bg-white px-[15px] py-[25px] text-center lg:px-[25px]">
        <h3 className="mb-[10px] text-[20px] font-normal leading-[28px] text-black lg:text-[24px] lg:leading-[33.6px]">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-[21px] leading-[33.6px] text-[#0c0c0c] lg:line-clamp-2 lg:text-[18px] lg:leading-[25px]">
          {plainExcerpt(post.excerpt)}
        </p>
        <span className="mt-[15px] text-[13px] font-extrabold uppercase leading-[13px] text-[#d52027]">המשיכי לקרוא</span>
      </div>
    </Link>
  );
}
