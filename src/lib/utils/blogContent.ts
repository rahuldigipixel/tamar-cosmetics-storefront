/**
 * Reduces a WordPress post's rendered `content` to plain article markup —
 * headings, paragraphs, lists, links, tables and images only.
 *
 * Posts on the legacy site are built in Elementor, so WPGraphQL's `content`
 * is full of builder wrappers, inline <style> blocks and live widgets
 * (product carousels, forms, sliders, shortcode output) that need the
 * Elementor/WoodMart JS + CSS we don't ship. Everything except the text-editor,
 * image and heading widgets is dropped, every attribute except the few that
 * carry meaning (href, img src/alt/size, text-align) is stripped, and
 * non-whitelisted tags are unwrapped (their text is kept).
 */

const SKIP_TAGS = new Set([
  "style", "script", "noscript", "form", "button", "select", "textarea", "iframe", "svg", "template", "label", "video", "audio", "object",
]);
const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link", "source", "wbr"]);
const KEEP_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "br", "hr", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "img",
  "blockquote", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td",
]);
const KEEP_WIDGETS = new Set(["text-editor", "image", "heading"]);
const SKIP_CLASS = /swiper|slick|carousel|slider|wd-products|flashy|berocket|woocommerce|product-grid/i;

const TOKEN = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|[^<]+|</g;

function attr(attrs: string, name: string): string | null {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(attrs);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function escapeAttr(v: string): string {
  return v.replace(/"/g, "&quot;");
}

// Links/images copied from the dev/staging backend point at its origin — make them site-relative.
function relative(url: string): string {
  return url.replace(/^https?:\/\/(?:192\.168\.0\.107\/tamarcosmetics|(?:www\.)?tamarcosmetics\.co\.il|[\w.-]+\.upress\.link|digipixeldemo\.com\/tamarcosmetics)(?=\/|$)/i, "") || "/";
}

function textAlign(attrs: string): string {
  const style = attr(attrs, "style");
  const m = style ? /text-align\s*:\s*(left|right|center|justify)/i.exec(style) : null;
  return m ? ` style="text-align:${m[1].toLowerCase()}"` : "";
}

function openTag(tag: string, attrs: string): string {
  switch (tag) {
    case "a": {
      const href = attr(attrs, "href");
      if (!href || /^\s*javascript:/i.test(href)) return "<a>";
      return `<a href="${escapeAttr(relative(href))}">`;
    }
    case "img": {
      const src = attr(attrs, "data-src") || attr(attrs, "src");
      if (!src || src.startsWith("data:")) return "";
      const parts = [`src="${escapeAttr(relative(src))}"`, `alt="${escapeAttr(attr(attrs, "alt") ?? "")}"`, 'loading="lazy"', 'decoding="async"'];
      const width = attr(attrs, "width");
      const height = attr(attrs, "height");
      if (width && /^\d+$/.test(width)) parts.push(`width="${width}"`);
      if (height && /^\d+$/.test(height)) parts.push(`height="${height}"`);
      const srcset = attr(attrs, "srcset");
      if (srcset) parts.push(`srcset="${escapeAttr(srcset.replace(/(^|,\s*)(https?:\/\/[^\s,]+)/g, (_, pre, u) => pre + relative(u)))}"`, 'sizes="(max-width: 1024px) 100vw, 1024px"');
      return `<img ${parts.join(" ")}>`;
    }
    case "p":
    case "div":
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
    case "li":
    case "td":
    case "th":
      return `<${tag}${textAlign(attrs)}>`;
    default:
      return `<${tag}>`;
  }
}

function skipsSubtree(tag: string, attrs: string): boolean {
  if (SKIP_TAGS.has(tag)) return true;
  if (tag !== "div" && tag !== "section" && tag !== "aside" && tag !== "ul") return false;
  const widget = attr(attrs, "data-widget_type");
  if (widget && !KEEP_WIDGETS.has(widget.split(".")[0])) return true;
  const cls = attr(attrs, "class");
  return !!cls && SKIP_CLASS.test(cls);
}

const EMPTY_BLOCK = /<(p|div|li|h[1-6])(?:\s[^>]*)?>(?:\s|&nbsp;| |<br>)*<\/\1>/gi;

export function cleanBlogContent(html: string): string {
  if (!html) return "";
  const out: string[] = [];
  const stack: string[] = [];
  let skipTag: string | null = null;
  let skipDepth = 0;

  for (const m of html.matchAll(TOKEN)) {
    const [raw, closeName, openName, attrs = ""] = m;

    if (skipTag) {
      if (openName && openName.toLowerCase() === skipTag && !raw.endsWith("/>")) skipDepth++;
      else if (closeName && closeName.toLowerCase() === skipTag && --skipDepth === 0) skipTag = null;
      continue;
    }

    if (raw.startsWith("<!--")) continue;

    if (openName) {
      const tag = openName.toLowerCase();
      if (skipsSubtree(tag, attrs)) {
        if (!VOID_TAGS.has(tag) && !raw.endsWith("/>")) {
          skipTag = tag;
          skipDepth = 1;
        }
        continue;
      }
      if (!KEEP_TAGS.has(tag)) continue;
      const rendered = openTag(tag, attrs);
      if (!rendered) continue;
      out.push(rendered);
      if (!VOID_TAGS.has(tag)) stack.push(tag);
    } else if (closeName) {
      const tag = closeName.toLowerCase();
      const idx = stack.lastIndexOf(tag);
      if (idx === -1) continue;
      while (stack.length > idx) out.push(`</${stack.pop()}>`);
    } else {
      out.push(raw === "<" ? "&lt;" : raw);
    }
  }
  while (stack.length) out.push(`</${stack.pop()}>`);

  let result = out.join("");
  // Removing empties can expose newly-empty parents (e.g. a <div> that only held an empty <p>) — repeat until stable.
  for (let prev = ""; prev !== result; ) {
    prev = result;
    result = result.replace(EMPTY_BLOCK, "");
  }
  return result.trim();
}
