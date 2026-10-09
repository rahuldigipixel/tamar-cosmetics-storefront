"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Lucide has no brand icons — a plain speech-bubble glyph doesn't read as
// "WhatsApp" the way the real logo mark does, so this is the actual outline.
// Exported for reuse by Header.tsx's service icon strip.
export function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.664 4.522 1.813 6.377L4 29l7.828-1.766A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.75a9.7 9.7 0 0 1-4.95-1.356l-.355-.21-4.64 1.047 1.02-4.532-.232-.372A9.7 9.7 0 0 1 5.25 15c0-5.93 4.824-10.75 10.754-10.75S26.758 9.07 26.758 15 21.934 24.75 16.004 24.75z" />
      <path d="M21.62 17.507c-.303-.152-1.793-.885-2.07-.987-.278-.101-.48-.152-.682.152-.202.303-.783.986-.96 1.19-.176.202-.353.227-.656.076-.303-.152-1.278-.472-2.435-1.505-.9-.803-1.508-1.795-1.685-2.098-.176-.303-.019-.467.132-.618.136-.135.303-.353.454-.53.152-.176.202-.303.303-.505.101-.202.05-.379-.025-.53-.076-.152-.682-1.645-.934-2.253-.246-.59-.497-.51-.682-.52l-.581-.01a1.12 1.12 0 0 0-.808.379c-.278.303-1.06 1.036-1.06 2.527 0 1.492 1.086 2.933 1.238 3.135.152.202 2.138 3.264 5.181 4.577.724.312 1.288.499 1.729.638.727.231 1.388.198 1.911.12.583-.087 1.793-.733 2.046-1.44.253-.708.253-1.315.177-1.44-.076-.126-.278-.202-.581-.353z" />
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
        className="group fixed bottom-[80px] left-5 z-[80] flex items-center sm:left-6 lg:bottom-[84px]"
        dir="ltr"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4dc247] text-white shadow-[0_6px_20px_-4px_rgba(0,0,0,0.3)]">
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
        className={`fixed bottom-[136px] left-5 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-brand-accent sm:left-6 lg:bottom-6 ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
