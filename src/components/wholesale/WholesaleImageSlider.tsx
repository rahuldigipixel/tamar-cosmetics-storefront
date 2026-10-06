"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import type { WholesaleImage } from "@/lib/wpgraphql/tamarApi";

/**
 * The bottom photo strip on the wholesale page — several images visible at
 * once (not the single hero image next to the CTA form) — same card-width
 * carousel pattern as CategorySlider.tsx/BestSellers.tsx per AGENTS.md.
 */
export function WholesaleImageSlider({ images }: { images: WholesaleImage[] }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<WholesaleImage, HTMLDivElement>({
    items: images,
  });

  if (images.length === 0) return null;

  return (
    <div className="relative">
      {images.length > 1 ? (
        // Same side arrows as the ProductSlider rails (home / product pages).
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="absolute -start-13 max-md:-start-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}

      <div className="overflow-clip [overflow-clip-margin:2px]">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {looped.map((image, i) => (
            <div
              key={`${image.id}-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative aspect-square w-[calc((100%-1rem)/2)] shrink-0 snap-start overflow-hidden rounded-2xl bg-brand-soft/30 sm:w-[calc((100%-2rem)/3)]"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="absolute -end-13 max-md:-end-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
