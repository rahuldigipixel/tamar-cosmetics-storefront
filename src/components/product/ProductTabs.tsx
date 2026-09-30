"use client";

import { useState } from "react";
import type { ProductAttribute } from "@/types/product";

interface Tab {
  title: string;
  content: string;
}

type Section =
  | { title: string; kind: "html"; content: string }
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

export function ProductTabs({
  description,
  attributes,
  tabs,
}: {
  description?: string;
  attributes?: ProductAttribute[];
  tabs: Tab[];
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
  ];
  const [active, setActive] = useState(0);

  if (sections.length === 0) return null;
  const activeSection = sections[Math.min(active, sections.length - 1)];

  return (
    <div className="mx-auto mt-[40px] w-full max-w-[1380px]">
      <div role="tablist" className="flex justify-between gap-x-[24px] overflow-x-auto overflow-y-hidden border-b border-[#ddd]">
        {sections.map((section, i) => {
          const isActive = section === activeSection;
          return (
            <button
              key={section.title + i}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`-mb-px shrink-0 border-b-[3px] px-[6px] py-[14px] text-[17px] leading-[24px] font-bold whitespace-nowrap transition-colors hover:text-black ${
                isActive ? "border-brand-accent text-black" : "border-transparent text-[#777]"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {activeSection.kind === "specs" ? (
        <div className="py-[20px]">
          <table className="w-full max-w-2xl text-right text-[15px]">
            <tbody>
              {attributes?.map((attr) => (
                <tr key={attr.id} className="border-b border-black/5">
                  <td className="py-2.5 pe-4 font-semibold text-black/70">{attr.label || attr.name}</td>
                  <td className="py-2.5 text-black/60">
                    {(attr.optionNames?.length ? attr.optionNames : attr.options.map(humanizeAttributeOption)).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="max-w-none py-[20px] text-right text-[18px] leading-[31px] text-[#333] [&_a]:text-brand-accent [&_h1]:my-[10px] [&_h1]:text-[24px] [&_h1]:font-bold [&_h2]:my-[10px] [&_h2]:text-[20px] [&_h2]:font-bold [&_h3]:my-[10px] [&_h3]:text-[17px] [&_h3]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_li]:my-[6px] [&_ol]:my-[12px] [&_ol]:list-decimal [&_ol]:ps-[25px] [&_p]:my-[10px] [&_strong]:font-bold [&_table]:w-full [&_td]:border-b [&_td]:border-black/10 [&_td]:py-[8px] [&_ul]:my-[12px] [&_ul]:list-disc [&_ul]:ps-[25px]"
          dangerouslySetInnerHTML={{ __html: activeSection.content }}
        />
      )}
    </div>
  );
}
