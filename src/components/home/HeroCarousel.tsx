"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import type { HomePageSlide } from "@/lib/wpgraphql/tamarApi";

// Slides render at the first slide's aspect ratio, filling 100% width (object-cover
// only trims a slide whose uploaded ratio differs from the first) and at
// quality 90 so wp-admin's uploaded artwork shows as-is. All slides in a track
// share the first slide's ratio so the track height doesn't jump between slides.
const FALLBACK_ASPECT = 16 / 5;
const HERO_IMAGE_QUALITY = 90;

function slideAspect(slide: HomePageSlide) {
  return slide.width > 0 && slide.height > 0 ? slide.width / slide.height : FALLBACK_ASPECT;
}

function HeroSingleSlide({ slide, aspect }: { slide: HomePageSlide; aspect: number }) {
  return (
    <div className="relative w-full sm:!aspect-auto sm:h-[570px]" style={{ aspectRatio: aspect }}>
      <Link href={slide.link || "/shop"} className="relative block h-full w-full">
        <Image src={slide.url} alt={slide.alt} fill priority quality={HERO_IMAGE_QUALITY} sizes="(min-width: 1600px) 1570px, 100vw" className="object-cover" />
      </Link>
    </div>
  );
}

function HeroTrack({ slides }: { slides: HomePageSlide[] }) {
  const aspect = slideAspect(slides[0]);
  const { trackRef, itemRefs, looped, step, middleStart } = useInfiniteCarousel<HomePageSlide, HTMLDivElement>({
    items: slides,
    autoplayMs: 6000,
  });

  // A single slide has nothing to carousel between — render it as a plain
  // static image with no arrows/autoplay/looping track instead of a
  // one-item "carousel" that can never actually move.
  if (slides.length === 1) {
    return <HeroSingleSlide slide={slides[0]} aspect={aspect} />;
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
            className="relative w-full shrink-0 snap-start sm:!aspect-auto sm:h-[570px]"
            style={{ aspectRatio: aspect }}
          >
            <Link href={slide.link || "/shop"} className="relative block h-full w-full">
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                priority={i === middleStart}
                quality={HERO_IMAGE_QUALITY}
                sizes="(min-width: 1600px) 1570px, 100vw"
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

  // If only one set is saved in wp-admin, reuse it for the other viewport rather
  // than showing nothing there.
  const desktop = hasDesktop ? desktopSlides! : mobileSlides!;
  const mobile = hasMobile ? mobileSlides! : desktop;

  return (
    <section className="relative mx-auto w-full max-w-[1600px] px-[15px]">
      <div className="hidden sm:block">
        <HeroTrack slides={desktop} />
      </div>
      <div className="sm:hidden">
        <HeroTrack slides={mobile} />
      </div>
    </section>
  );
}
