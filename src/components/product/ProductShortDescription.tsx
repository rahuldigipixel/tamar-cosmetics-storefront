"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const COLLAPSED_LINE_CLAMP = "line-clamp-8";

export function ProductShortDescription({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Only true once line-clamp is actually cutting text off — a short
    // description that already fits within the clamp shouldn't show a
    // "read more" toggle that does nothing.
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [html]);

  return (
    <div className="mt-3">
      <div
        ref={contentRef}
        className={`prose prose-sm max-w-none text-right text-black/70 ${expanded ? "" : COLLAPSED_LINE_CLAMP}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {overflowing ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 flex items-center gap-1 text-base font-semibold text-brand-accent"
        >
          {expanded ? "הצג פחות" : "קראו עוד"}
          {expanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </div>
  );
}
