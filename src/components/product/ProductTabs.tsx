"use client";

import { useState } from "react";
import type { ProductAttribute } from "@/types/product";

interface Tab {
  title: string;
  content: string;
}

/** "אודות המותג" tab: the product's brand description only (no logo). */
export interface AboutBrand {
  html: string;
}

type Section =
  | { title: string; kind: "html"; content: string }
  | { title: string; kind: "brand"; content: string }
  | { title: string; kind: "specs"; content: "" };

const SPECS_TITLE = "מפרט טכני";

// WPGraphQL returns each option of a global (taxonomy-based) attribute as
// the term's raw slug rather than its display name (e.g.
// "d7%a4...-france-beauty" — itself the percent-encoded slug), while local
// attributes come through as plain text already. Decoding + de-hyphenating
// turns the former into readable text without a schema change.
function humanizeAttributeOption(value: string) {
  try {
    return decodeURIComponent(value).replace(/-/g, " ").trim();
  } catch {
    return value;
  }
}

/** True when the HTML has no visible text and no media — e.g. "<p>&nbsp;</p>". */
function isBlankHtml(html: string | undefined) {
  if (!html) return true;
  if (/<(img|iframe|video|audio|svg)\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;|\s/gi, "") === "";
}

const PLACEHOLDER_HEADING = /^(כתוב את הכותרת כאן|הכנס כותרת כאן|click to edit|heading)$/i;

/**
 * Editor HTML → safe heading structure: drops leftover page-builder placeholder headings, turns headings that are
 * really whole paragraphs (> 120 chars) into <p>, and demotes any <h1> to <h2> (the page's own title is the only h1).
 */
function cleanHeadings(html: string) {
  return html
    .replace(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s+/g, " ").trim();
      if (!text || PLACEHOLDER_HEADING.test(text)) return "";
      if (text.length > 120) return `<p${attrs}>${inner}</p>`;
      return level === "1" ? `<h2${attrs}>${inner}</h2>` : full;
    });
}

export function ProductTabs({
  description,
  attributes,
  tabs,
  aboutBrand,
  shippingReturnsHtml,
}: {
  description?: string;
  attributes?: ProductAttribute[];
  tabs: Tab[];
  aboutBrand?: AboutBrand;
  shippingReturnsHtml?: string;
}) {
  // Tabs come from YITH Tab Manager (backend already drops empty ones; the
  // blank check here also covers whitespace-only editor output). The WooCommerce
  // description and the attribute table only fill in when they have content,
  // and the attribute table yields to a YITH "מפרט טכני" tab of its own.
  const customTabs = tabs.filter((t) => !isBlankHtml(t.content));
  const hasCustomSpecs = customTabs.some((t) => t.title.trim() === SPECS_TITLE);
  const hasSpecs = Boolean(attributes && attributes.length > 0) && !hasCustomSpecs;

  const sections: Section[] = [
    ...(isBlankHtml(description) ? [] : [{ title: "תיאור", kind: "html" as const, content: description ?? "" }]),
    ...(hasSpecs ? [{ title: SPECS_TITLE, kind: "specs" as const, content: "" as const }] : []),
    ...customTabs.map((t) => ({ title: t.title, kind: "html" as const, content: t.content })),
    // Always last, in this order: אודות המותג, משלוחים והחזרות.
    ...(aboutBrand && !isBlankHtml(aboutBrand.html)
      ? [{ title: "אודות המותג", kind: "brand" as const, content: aboutBrand.html }]
      : []),
    // Shown whenever the admin toggle is on, even if its content is empty.
    ...(shippingReturnsHtml !== undefined ? [{ title: "משלוחים והחזרות", kind: "html" as const, content: shippingReturnsHtml ?? "" }] : []),
  ];
  const [active, setActive] = useState(0);

  if (sections.length === 0) return null;
  const activeSection = sections[Math.min(active, sections.length - 1)];

  return (
    <div className="mx-auto mt-[30px] w-full max-w-[1380px] md:mt-[80px]">
      <div role="tablist" className={`grid ${sections.length <= 3 || sections.length % 3 === 0 ? "grid-cols-3" : "grid-cols-2"} gap-x-[4px] border-b border-[#ddd] md:flex md:justify-between md:gap-x-[24px] md:overflow-x-auto md:overflow-y-hidden`}>
        {sections.map((section, i) => {
          const isActive = section === activeSection;
          return (
            <button
              key={section.title + i}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`-mb-px justify-self-start border-b-[3px] px-0 py-[8px] text-right md:px-[6px] text-[16px] leading-[24px] font-bold md:shrink-0 md:py-[14px] md:whitespace-nowrap transition-colors hover:text-black ${
                isActive ? "border-brand-accent text-black" : "border-transparent text-[#777]"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Every panel is rendered (inactive ones `hidden`) so crawlers get all tab content in the server HTML. */}
      {sections.map((section, i) => (
        <div key={section.title + i} role="tabpanel" hidden={section !== activeSection}>
      {section.kind === "brand" ? (
        // Rendered exactly as saved in the brand description (headings, paragraphs, inline
        // alignment/size styles and images keep the editor's structure), like the legacy tab.
        <div
          className="py-[20px] text-[16px] leading-[34px] text-[#0c0c0c] [&_div]:my-[16px] [&_h1]:my-[16px] [&_h1]:text-[28px] [&_h1]:leading-[1.3] [&_h1]:font-bold [&_h2]:my-[16px] [&_h2]:text-[24px] [&_h2]:leading-[1.3] [&_h2]:font-bold [&_h3]:my-[16px] [&_h3]:text-[16px] [&_h3]:leading-[34px] [&_h3]:font-bold [&_h4]:my-[8px] [&_h4]:text-[16px] [&_h4]:font-bold [&_img]:inline-block [&_img]:h-auto [&_img]:max-w-full [&_p]:my-[16px] [&_strong]:font-bold [&_a]:text-brand-accent"
          dangerouslySetInnerHTML={{ __html: cleanHeadings(section.content) }}
        />
      ) : section.kind === "specs" ? (
        <div className="py-[20px]">
          <table className="w-full max-w-2xl text-right text-[21px] leading-[34px] text-[#0c0c0c]">
            <tbody>
              {attributes?.map((attr) => (
                <tr key={attr.id} className="border-b border-black/5">
                  <td className="py-2.5 pe-4 font-semibold text-[#0c0c0c]">{attr.label || attr.name}</td>
                  <td className="py-2.5 text-[#0c0c0c]">
                    {(attr.optionNames?.length ? attr.optionNames : attr.options.map(humanizeAttributeOption)).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="max-w-none py-[20px] text-right text-[21px] leading-[34px] text-[#0c0c0c] [&_a]:text-brand-accent [&_h1]:my-[10px] [&_h1]:text-[24px] [&_h1]:font-bold [&_h2]:my-[10px] [&_h2]:text-[20px] [&_h2]:font-bold [&_h3]:my-[10px] [&_h3]:text-[17px] [&_h3]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_li]:my-[6px] [&_ol]:my-[12px] [&_ol]:list-decimal [&_ol]:ps-[25px] [&_p]:my-[10px] [&_strong]:font-bold [&_table]:w-full [&_td]:border-b [&_td]:border-black/10 [&_td]:py-[8px] [&_ul]:my-[12px] [&_ul]:list-disc [&_ul]:ps-[25px]"
          dangerouslySetInnerHTML={{ __html: cleanHeadings(section.content) }}
        />
      )}
        </div>
      ))}
    </div>
  );
}
