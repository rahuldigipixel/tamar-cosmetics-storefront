"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import type { AboutImage } from "@/lib/wpgraphql/tamarApi";

// Hot-linked legacy-site images can't go through the image optimizer (host not allow-listed).
const isLegacyHost = (url: string) => url.includes("tamarcosmetics.co.il");

/**
 * About-page photo slider (legacy: Elementor image carousel) — 3 square slides per
 * view on desktop / 1 on mobile, no gap, autoplay every 5s. Navigation matches the home
 * ProductSlider (round white arrow buttons on the sides, no pagination dots).
 * Same seamless loop hook as the other sliders (useInfiniteCarousel).
 * `rounded` (flagship page): 6px gaps and 12px-rounded photos.
 */
export function AboutImageSlider({
  images,
  rounded = false,
}: {
  images: AboutImage[];
  rounded?: boolean;
}) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<
    AboutImage,
    HTMLDivElement
  >({
    items: images,
    autoplayMs: 5000,
  });
  const count = images.length;
  if (count === 0) return null;
  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative aspect-square w-full shrink-0 snap-start lg:w-1/3 ${rounded ? "px-[3px]" : ""}`}
          >
            <div
              className={`relative h-full w-full overflow-hidden ${rounded ? "rounded-[12px]" : ""}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                unoptimized={isLegacyHost(image.url)}
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="הקודם"
            className="absolute -start-13 max-md:-start-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="הבא"
            className="absolute -end-13 max-md:-end-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      ) : null}
    </div>
  );
}
