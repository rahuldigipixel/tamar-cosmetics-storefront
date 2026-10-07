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

/** Drops editor filler (empty/&nbsp; paragraphs, repeated <br>s) so spacing never depends on how the admin typed. */
function cleanHtml(html: string): string {
  const filler = String.raw`(?:\s|&nbsp;|&#160;| |<br\s*\/?>)*`;
  const block = String.raw`<\/?(?:p|div|h[1-6]|ul|ol|li|table)\b[^>]*>`;
  const brBefore = new RegExp(String.raw`(${block})(?:\s|<br\s*\/?>)+`, "gi");
  const brAfter = new RegExp(String.raw`(?:\s|<br\s*\/?>)+(?=${block})`, "gi");
  return html
    // <br>s next to block tags (e.g. <div>…</div><br><div>…</div>) only add blank lines.
    .replace(brBefore, "$1")
    .replace(brAfter, "")
    .replace(new RegExp(String.raw`<(p|div|h[1-6]|span)\b[^>]*>${filler}<\/\1>`, "gi"), "")
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>")
    .trim();
}

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
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[4px] border border-[#d5d8dc] text-[16px] text-black"
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
            className={`pt-[20px] font-[family-name:Arial,Helvetica,sans-serif] ${contentClassName} [&_div]:px-0 [&>div]:mb-[16px] [&>*:last-child]:mb-0 [&_h1]:mb-[20px] [&_h1]:mt-[24px] [&_h1]:text-[24px] [&_h1]:leading-[34px] [&_h1]:font-bold [&_h5]:mb-[20px] [&_h5]:mt-[24px] [&_h5]:text-[24px] [&_h5]:leading-[34px] [&_h5]:font-bold [&_h6]:mb-[20px] [&_h6]:mt-[24px] [&_h6]:text-[24px] [&_h6]:leading-[34px] [&_h6]:font-bold [&_h2]:mb-[20px] [&_h2]:mt-[24px] [&_h2]:text-[24px] [&_h2]:leading-[34px] [&_h2]:font-bold [&_h3]:mb-[20px] [&_h3]:mt-[24px] [&_h3]:text-[24px] [&_h3]:leading-[34px] [&_h3]:font-bold [&_h4]:mb-[20px] [&_h4]:mt-[24px] [&_h4]:text-[24px] [&_h4]:leading-[34px] [&_h4]:font-bold [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>h4:first-child]:mt-0 [&>h1:first-child]:mt-0 [&>h5:first-child]:mt-0 [&>h6:first-child]:mt-0 [&_p]:m-0 [&_p]:mb-[16px] [&_strong]:font-bold`}
            dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
          />
        </div>
      </div>
    </div>
  );
}
