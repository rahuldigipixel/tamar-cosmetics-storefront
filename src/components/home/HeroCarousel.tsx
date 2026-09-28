"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import type { HomePageSlide } from "@/lib/wpgraphql/tamarApi";

function HeroSingleSlide({ slide, aspectClassName }: { slide: HomePageSlide; aspectClassName: string }) {
  return (
    <div className={`relative w-full ${aspectClassName}`}>
      <Link href={slide.link || "/shop"} className="relative block h-full w-full">
        <Image src={slide.url} alt={slide.alt} fill priority sizes="100vw" className="object-cover" />
      </Link>
    </div>
  );
}

function HeroTrack({ slides, aspectClassName }: { slides: HomePageSlide[]; aspectClassName: string }) {
  const { trackRef, itemRefs, looped, step, middleStart } = useInfiniteCarousel<HomePageSlide, HTMLDivElement>({
    items: slides,
    autoplayMs: 6000,
  });

  // A single slide has nothing to carousel between — render it as a plain
  // static image with no arrows/autoplay/looping track instead of a
  // one-item "carousel" that can never actually move.
  if (slides.length === 1) {
    return <HeroSingleSlide slide={slides[0]} aspectClassName={aspectClassName} />;
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((slide, i) => (
          <div
            key={`${slide.id}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative w-full shrink-0 snap-start ${aspectClassName}`}
          >
            <Link href={slide.link || "/shop"} className="relative block h-full w-full">
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                priority={i === middleStart}
                sizes="100vw"
                className="object-cover"
              />
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => step(-1)}
        aria-label="הקודם"
        className="absolute inset-y-0 start-2 flex items-center sm:start-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-colors hover:bg-white sm:h-11 sm:w-11">
          <ChevronRight className="h-5 w-5" />
        </span>
      </button>
      <button
        onClick={() => step(1)}
        aria-label="הבא"
        className="absolute inset-y-0 end-2 flex items-center sm:end-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-colors hover:bg-white sm:h-11 sm:w-11">
          <ChevronLeft className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}

export function HeroCarousel({
  desktopSlides,
  mobileSlides,
}: {
  desktopSlides?: HomePageSlide[];
  mobileSlides?: HomePageSlide[];
}) {
  const hasDesktop = Boolean(desktopSlides && desktopSlides.length > 0);
  const hasMobile = Boolean(mobileSlides && mobileSlides.length > 0);
  if (!hasDesktop && !hasMobile) return null;

  // If only one set is saved in wp-admin, reuse it for the other viewport
  // rather than showing nothing there. A dedicated mobile set is a portrait
  // crop (recommended 800×900), so it gets its own aspect ratio; reusing the
  // wide desktop set on mobile keeps the desktop crop instead.
  const desktop = hasDesktop ? desktopSlides! : mobileSlides!;
  const mobile = hasMobile ? mobileSlides! : desktop;
  // ~75px taller than before at a 1920px-wide viewport (scales with width,
  // since these are aspect-ratio-based, not a fixed pixel height).
  const mobileAspect = hasMobile ? "aspect-[8/9]" : "aspect-[16/6]";

  return (
    <section className="relative bg-brand-soft/20">
      <div className="hidden sm:block">
        <HeroTrack slides={desktop} aspectClassName="aspect-[16/5]" />
      </div>
      <div className="sm:hidden">
        <HeroTrack slides={mobile} aspectClassName={mobileAspect} />
      </div>
    </section>
  );
}
