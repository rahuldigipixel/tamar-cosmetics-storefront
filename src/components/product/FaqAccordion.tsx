"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

/**
 * Collapsed "שאלות נפוצות" bar that expands smoothly (grid-rows 0fr → 1fr)
 * to show admin-authored HTML. The HTML stays in the server-rendered markup
 * while closed (SEO), just clipped and made inert.
 */
// Default text styles for content that carries no sizes of its own (legacy-site values).
const DEFAULT_CONTENT_CLASS = "text-[21px] leading-[34px] text-[#0c0c0c]";

export function FaqAccordion({
  title,
  html,
  contentClassName = DEFAULT_CONTENT_CLASS,
}: {
  title: string;
  html: string;
  /** Overrides the default size/line-height/colour of the expanded text. */
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[4px] border border-[#d5d8dc] text-[16px] text-[#242424]"
      >
        {open ? <Minus className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
        {title}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div
            className={`pt-[20px] ${contentClassName} [&_h2]:mb-[16px] [&_h2]:text-[24px] [&_h2]:font-bold [&_h3]:mb-[16px] [&_h3]:text-[24px] [&_h3]:font-bold [&_h4]:mb-[16px] [&_h4]:text-[24px] [&_h4]:font-bold [&_p]:mb-[20px] [&_strong]:font-bold`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
