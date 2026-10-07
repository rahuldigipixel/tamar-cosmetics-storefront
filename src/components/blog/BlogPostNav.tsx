import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { AdjacentPostLink } from "@/lib/wpgraphql/posts";

/**
 * Newer/older post links under a single post. Sizes measured from the legacy
 * post page at the user's explicit request: 18.9px Arial label (#bbb) + title,
 * 40px bordered circle icons, grid "back to list" icon in the middle; the
 * title is hidden on mobile (label only), as on the legacy site.
 */
export function BlogPostNav({ newer, older }: { newer: AdjacentPostLink | null; older: AdjacentPostLink | null }) {
  if (!newer && !older) return null;

  const btn = "relative block min-h-[60px] py-[15px] text-[18.9px] leading-[30.24px] lg:min-h-[112px] lg:py-[25px]";
  const label = "block font-semibold text-[#242424] lg:mb-[5px] lg:font-normal lg:text-[#bbb]";
  const title = "hidden text-[18.9px] leading-[26.46px] text-black lg:block";
  const icon =
    "absolute top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.106] text-[#333] transition-colors group-hover:border-black/30";

  return (
    <nav
      dir="rtl"
      aria-label="מאמרים נוספים"
      className="mb-10 flex items-stretch border-b border-black/[0.105] pt-[30px] font-[family-name:Arial,Helvetica,sans-serif] lg:mb-[60px]"
    >
      <div className="min-w-0 flex-1">
        {newer ? (
          <Link href={`/${newer.slug}/`} prefetch={false} className={`group ${btn} pl-[20px] pr-[55px] text-start`}>
            <span className={icon + " right-0"}>
              <ChevronRight className="h-4 w-4" />
            </span>
            <span className={label}>חדש יותר</span>
            <span className={title}>{newer.title}</span>
          </Link>
        ) : null}
      </div>

      <Link
        href="/blog/"
        aria-label="חזרה לרשימה"
        className="group relative flex h-[40px] w-[36px] shrink-0 items-center justify-center self-center text-[#bbb] transition-colors hover:text-[#242424] lg:w-[39px]"
      >
        <LayoutGrid className="h-[20px] w-[20px] stroke-[1.5]" />
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-[8px] hidden -translate-x-1/2 whitespace-nowrap bg-black px-[15px] py-[7px] text-[12px] font-normal leading-[19.2px] text-white opacity-0 transition-opacity duration-200 after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[5px] after:border-t-[5px] after:border-x-transparent after:border-t-black group-hover:opacity-100 lg:block">
          חזרה לרשימה
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        {older ? (
          <Link href={`/${older.slug}/`} prefetch={false} className={`group ${btn} pl-[55px] pr-[20px] text-end`}>
            <span className={icon + " left-0"}>
              <ChevronLeft className="h-4 w-4" />
            </span>
            <span className={label}>ישן יותר</span>
            <span className={title}>{older.title}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
