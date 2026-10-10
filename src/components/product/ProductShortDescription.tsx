"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

const COLLAPSED_HEIGHT = 84; // 4 lines × 21px (legacy `.ee-unfold__mask` height)

/**
 * Short description clamped to 4 lines (no fade overlay) with a "קראו עוד" / "סגירה" toggle. Expanding/collapsing
 * animates the height instead of jumping. The toggle only appears when the
 * text is actually taller than 4 lines.
 */
export function ProductShortDescription({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(COLLAPSED_HEIGHT);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [html]);

  const overflowing = fullHeight > COLLAPSED_HEIGHT + 1;

  return (
    <div className="mt-[20px]">
      <div className="relative">
        <div
          ref={contentRef}
          style={{ maxHeight: expanded || !overflowing ? fullHeight : COLLAPSED_HEIGHT, fontFamily: '"Open Sans Hebrew", sans-serif' }}
          className="max-w-none overflow-hidden text-right text-[15px] leading-[21px] text-[#0c0c0c] md:text-[16px] transition-[max-height] duration-500 ease-in-out [&_p]:mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {overflowing ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-[10px] flex items-center gap-[6px] text-[16px] leading-none text-black"
        >
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-black text-white">
            {expanded ? <Minus className="h-[11px] w-[11px]" strokeWidth={3} /> : <Plus className="h-[11px] w-[11px]" strokeWidth={3} />}
          </span>
          {expanded ? "סגירה" : "קראו עוד"}
        </button>
      ) : null}
    </div>
  );
}
