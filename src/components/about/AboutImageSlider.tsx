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
  // Flagship page: arrows sit beside the photos exactly like the wholesale
  // slider; the plain About slider keeps them overlaid on the edges.
  const startPos = rounded ? "-start-[11px] min-[1704px]:-start-13" : "start-0";
  const endPos = rounded ? "-end-[11px] min-[1704px]:-end-13" : "end-0";
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
            className={`absolute ${startPos} top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-none bg-[#fff0ef] text-black transition-colors hover:text-brand-accent`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="הבא"
            className={`absolute ${endPos} top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-none bg-[#fff0ef] text-black transition-colors hover:text-brand-accent`}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </>
      ) : null}
    </div>
  );
}
