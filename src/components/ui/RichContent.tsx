/**
 * Renders admin/editor-authored HTML (wp_editor content via wpautop, or a
 * WPGraphQL post's `content`) with consistent typography — shared by the
 * wholesale page, reviews page, and blog so each doesn't repeat the same
 * long className. No @tailwindcss/typography plugin is installed, so the
 * element styling is spelled out here via arbitrary-variant selectors.
 */
export function RichContent({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;

  return (
    <div
      className={`text-lg leading-relaxed text-black/75 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-black [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-black [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-black [&_a]:text-brand-accent [&_a]:underline [&_img]:my-4 [&_img]:rounded-xl ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
