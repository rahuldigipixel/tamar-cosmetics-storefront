"use client";

import { useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryCarouselItem } from "@/lib/wpgraphql/tamarApi";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";

/**
 * Category-page carousel (admin: "Enable Category Carousel" on the category).
 * Copied from the legacy Owl carousel (wps-woo-extended): 3/4/4/6/10 items per
 * view at <379/379/480/768/1024px with 12/12/14/18/25px gaps, 130px (82px
 * mobile) red-outlined circles, 14px/12px titles, plain chevron arrows, one
 * slide per click, looping only when there are more items than fit.
 */
const BREAKPOINTS = [1024, 768, 379] as const;
const VISIBLE = [10, 6, 4] as const;
const VISIBLE_MOBILE = 3;

function visibleCount(width: number) {
  const i = BREAKPOINTS.findIndex((bp) => width >= bp);
  return i === -1 ? VISIBLE_MOBILE : VISIBLE[i];
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// Per-view count + gap as CSS vars so the card width never depends on JS (no partial cutoff).
const TRACK_VARS =
  "[--n:3] [--g:12px] min-[379px]:[--n:4] min-[480px]:[--g:14px] md:[--n:6] md:[--g:18px] lg:[--n:10] lg:[--g:25px]";
const ITEM_WIDTH = "w-[calc((100%_-_(var(--n)_-_1)_*_var(--g))_/_var(--n))]";

function Item({ item, itemRef }: { item: CategoryCarouselItem; itemRef?: (el: HTMLDivElement | null) => void }) {
  const inner = (
    <>
      <div className="relative mx-auto flex aspect-square w-full max-w-[82px] items-center justify-center overflow-hidden rounded-full border border-[#D52027] bg-white p-[10px] md:max-w-[130px] md:p-[15px]">
        <div className="relative h-full w-[80%]">
          <Image
            src={item.image?.url || "/brand/logo.png"}
            alt={item.title}
            fill
            sizes="104px"
            className="object-contain mix-blend-multiply transition duration-[400ms] group-hover:scale-105 group-hover:opacity-90"
          />
        </div>
      </div>
      {item.title ? (
        <h4 className="mt-[10px] text-[12px] font-semibold leading-[1.4] text-[#333] md:mt-[14px] md:text-[14px]">
          {item.title}
        </h4>
      ) : null}
    </>
  );
  const cls = `group block shrink-0 text-center ${ITEM_WIDTH}`;
  return (
    <div ref={itemRef} className={cls}>
      {item.link ? (
        <Link href={item.link} prefetch={false} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

function LoopingRow({ items }: { items: CategoryCarouselItem[] }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<CategoryCarouselItem, HTMLDivElement>({ items, durationMs: 600 });
  // Same round white arrow buttons as ProductSlider: right = previous, left = next (RTL).
  const btn =
    "absolute top-[41px] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent md:top-[65px] md:h-10 md:w-10";
  return (
    <>
      <button type="button" aria-label="הקודם" onClick={() => step(-1)} className={`${btn} -right-[26px] md:-right-[52px]`}>
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="overflow-clip [overflow-clip-margin:2px]">
        <div
          ref={trackRef}
          className={`flex gap-[var(--g)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${TRACK_VARS}`}
        >
          {looped.map((item, i) => (
            <Item
              key={i}
              item={item}
              itemRef={(el) => {
                itemRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
      <button type="button" aria-label="הבא" onClick={() => step(1)} className={`${btn} -left-[26px] md:-left-[52px]`}>
        <ChevronLeft className="h-4 w-4" />
      </button>
    </>
  );
}

export function CategoryCarousel({ items }: { items: CategoryCarouselItem[] }) {
  const visible = useSyncExternalStore(
    subscribe,
    () => visibleCount(window.innerWidth),
    () => VISIBLE[0]
  );
  if (items.length === 0) return null;

  return (
    <div dir="rtl" className="mx-auto max-w-[1600px] px-[15px] pb-[10px] pt-[10px]">
      <div className="relative mx-0 max-[1699px]:mx-[56px] max-[767px]:mx-[28px]">
        {items.length > visible ? (
          <LoopingRow items={items} />
        ) : (
          <div className={`flex gap-[var(--g)] ${TRACK_VARS}`}>
            {items.map((item, i) => (
              <Item key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
