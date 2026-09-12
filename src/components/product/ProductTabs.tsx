"use client";

import { useState } from "react";
import type { ProductAttribute } from "@/types/product";

interface Tab {
  title: string;
  content: string;
}

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

export function ProductTabs({
  description,
  attributes,
  tabs,
}: {
  description?: string;
  attributes?: ProductAttribute[];
  tabs: Tab[];
}) {
  const hasSpecs = Boolean(attributes && attributes.length > 0);
  const sections = [
    { title: "תיאור", kind: "html" as const, content: description ?? "" },
    ...(hasSpecs ? [{ title: "מפרט טכני", kind: "specs" as const, content: "" }] : []),
    ...tabs.map((t) => ({ title: t.title, kind: "html" as const, content: t.content })),
  ];
  const [active, setActive] = useState(0);
  const activeSection = sections[active];

  return (
    <div className="mt-10">
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden border-b border-black/10">
        {sections.map((section, i) => (
          <button
            key={section.title + i}
            onClick={() => setActive(i)}
            className={`-mb-px shrink-0 border-b-2 px-1 py-2 text-base font-medium ${
              i === active ? "border-brand-accent text-brand-accent" : "border-transparent text-black/60"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {activeSection?.kind === "specs" ? (
        <div className="py-4">
          <table className="w-full max-w-2xl text-right text-base">
            <tbody>
              {attributes?.map((attr) => (
                <tr key={attr.id} className="border-b border-black/5">
                  <td className="py-2.5 pe-4 font-semibold text-black/70">{attr.label || attr.name}</td>
                  <td className="py-2.5 text-black/60">
                    {attr.options.map(humanizeAttributeOption).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none py-4 text-right"
          dangerouslySetInnerHTML={{ __html: activeSection?.content ?? "" }}
        />
      )}
    </div>
  );
}
