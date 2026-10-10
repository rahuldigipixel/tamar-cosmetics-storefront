"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Lucide has no brand icons — a plain speech-bubble glyph doesn't read as
// "WhatsApp" the way the real logo mark does, so this is the actual outline.
// Exported for reuse by Header.tsx's service icon strip.
export function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.492.655 4.83 1.8 6.858L2 30l7.322-1.775A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.4a11.34 11.34 0 01-5.788-1.587l-.414-.247-4.347 1.054 1.085-4.234-.27-.435A11.357 11.357 0 014.6 16C4.6 9.7 9.7 4.6 16 4.6S27.4 9.7 27.4 16 22.3 27.4 16 27.4zm6.21-8.537c-.34-.17-2.013-1-2.328-1.113-.315-.114-.545-.17-.774.17-.23.34-.888 1.113-1.09 1.343-.2.23-.4.256-.74.085-.34-.17-1.438-.53-2.74-1.693-1.013-.905-1.698-2.023-1.898-2.363-.2-.34-.02-.524.15-.693.154-.152.34-.4.51-.598.17-.2.226-.34.34-.57.113-.228.057-.428-.029-.598-.085-.17-.774-1.868-1.06-2.558-.28-.672-.563-.58-.774-.59l-.66-.011c-.228 0-.598.085-.912.428-.314.342-1.2 1.172-1.2 2.858s1.228 3.317 1.398 3.546c.17.228 2.416 3.69 5.853 5.174.818.353 1.457.564 1.955.722.821.261 1.569.224 2.16.136.66-.098 2.013-.823 2.298-1.617.284-.794.284-1.474.198-1.617-.084-.142-.313-.228-.654-.4z" />
    </svg>
  );
}

const SHOW_SCROLL_TOP_AFTER_PX = 400;

export function FloatingActions({ whatsappNumber }: { whatsappNumber: string }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > SHOW_SCROLL_TOP_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שוחחו איתנו בוואטסאפ"
        className="group fixed bottom-[80px] left-5 z-[80] flex items-center sm:left-6 lg:bottom-[65px]"
        dir="ltr"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_20px_-4px_rgba(0,0,0,0.3)]">
          <WhatsAppIcon className="h-7 w-7" />
        </span>
        <span
          dir="rtl"
          className="pointer-events-none absolute left-[52px] top-1/2 flex -translate-x-2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[16px] font-normal leading-6 text-[#444] opacity-0 shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
          <span aria-hidden>💭</span>
          <span>יש לך שאלה?</span>
        </span>
      </a>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="חזרה לראש העמוד"
        className={`fixed bottom-[136px] left-5 z-[80] flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-brand-accent sm:left-6 lg:bottom-3 ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
