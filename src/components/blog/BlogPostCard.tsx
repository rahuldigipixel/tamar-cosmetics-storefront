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
    .trim();
}

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/${post.slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full bg-brand-soft/30">
        {post.image ? (
          <Image
            src={post.image.url}
            alt={post.image.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {post.category ? (
          <span className="absolute bottom-3 start-3 rounded-full bg-brand-accent px-3 py-1 text-sm font-semibold text-white shadow-sm">
            {post.category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-xl font-bold leading-snug text-black/90 group-hover:text-brand-accent">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-base leading-relaxed text-black/60">{plainExcerpt(post.excerpt)}</p>
        <span className="mt-auto pt-2 text-base font-semibold text-brand-accent">המשיכי לקרוא</span>
      </div>
    </Link>
  );
}
