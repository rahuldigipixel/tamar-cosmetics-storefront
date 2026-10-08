/**
 * Post-processing for wp-admin editor HTML so it stays SEO/a11y-clean without touching the editor content:
 *  - demoteH1: a page has exactly one <h1> (its title), so editor <h1>s become <h2 data-h1> — the data attribute
 *    lets each container keep the h1 look it already had via an `[&_h2[data-h1]]:` variant.
 *  - addImgAlt: images saved without alt text get a fallback (the page/product/brand name) instead of nothing.
 */
export function demoteH1(html: string): string {
  return html.replace(/<h1\b/gi, "<h2 data-h1").replace(/<\/h1>/gi, "</h2>");
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function addImgAlt(html: string, fallback: string): string {
  if (!fallback) return html;
  const alt = `alt="${escapeAttr(fallback)}"`;
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
    if (/\balt\s*=\s*"[^"]+"/i.test(attrs) || /\balt\s*=\s*'[^']+'/i.test(attrs)) return match;
    // Drop an existing empty alt, then add the fallback.
    const cleaned = attrs.replace(/\salt\s*=\s*(""|'')/i, "");
    return `<img ${alt}${cleaned}>`;
  });
}

/** Both fixes in one call. */
export function cleanEditorHtml(html: string, altFallback: string): string {
  return addImgAlt(demoteH1(html), altFallback);
}
