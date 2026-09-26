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
            className="relative aspect-[4/3] w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl bg-brand-soft/30 shadow-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="הקודם"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => step(1)}
            aria-label="הבא"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
