import { cleanBlogContent } from "@/lib/utils/blogContent";
import { cleanEditorHtml } from "@/lib/utils/editorHtml";

/**
 * Single-post body. Sizes/colors measured from the legacy post page at the
 * user's explicit request (Arial/Helvetica, 18px body, 24px/22px bold
 * headings, 20px paragraph/heading gaps, centered images).
 */
export function BlogContent({ html, className = "", altFallback = "" }: { html: string; className?: string; altFallback?: string }) {
  const clean = cleanEditorHtml(cleanBlogContent(html), altFallback);
  if (!clean) return null;

  return (
    <div
      className={`text-right font-[family-name:Arial,Helvetica,sans-serif] text-[18px] leading-[25.2px] text-black lg:leading-[28.8px] [&_h1]:mb-5 [&_h1]:text-[28px] [&_h1]:font-bold [&_h1]:leading-[36px] [&_h2[data-h1]]:text-[28px] [&_h2[data-h1]]:leading-[36px] [&_h2]:mb-5 [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:leading-[33.6px] [&_h2]:text-[#0c0c0c] [&_h3]:mb-5 [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:leading-[30.8px] [&_h3]:text-[#0c0c0c] [&_h4]:mb-5 [&_h4]:text-[20px] [&_h4]:font-bold [&_h4]:leading-[28px] [&_h4]:text-[#0c0c0c] [&_h5]:mb-5 [&_h5]:font-bold [&_h6]:mb-5 [&_h6]:font-bold [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:mt-[10px] [&_ul]:list-disc [&_ul]:pr-[17px] [&_ol]:mb-5 [&_ol]:mt-[10px] [&_ol]:list-decimal [&_ol]:pr-[17px] [&_li]:mb-[10px] [&_li:last-child]:mb-0 [&_strong]:font-semibold [&_b]:font-semibold [&_a]:underline [&_img]:mx-auto [&_img]:mb-5 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_table]:mb-5 [&_table]:w-full [&_td]:border [&_td]:border-black/20 [&_td]:p-2 [&_th]:border [&_th]:border-black/20 [&_th]:p-2 [&_blockquote]:mb-5 [&_blockquote]:border-r-4 [&_blockquote]:border-black/20 [&_blockquote]:pr-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
