"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";

const SLIDES = [
 
  { src: "/banner3.jpg", href: "/shop?sale=1", alt: "קיץ של מבצעים באתר" },
  { src: "/banner1.jpg", href: "/shop?sale=1", alt: "קיץ של מבצעים באתר" },
  { src: "/banner2.jpg", href: "/shop", alt: "מוצרים חדשים בתמר קוסמטיקס" },
];

export function HeroCarousel() {
  const { trackRef, itemRefs, looped, step, middleStart } = useInfiniteCarousel<(typeof SLIDES)[number], HTMLDivElement>(
    { items: SLIDES, autoplayMs: 6000 }
  );

  return (
    <section className="relative bg-brand-soft/20">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((slide, i) => (
          <div
            key={`${slide.src}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="relative aspect-[16/6] w-full shrink-0 snap-start sm:aspect-[16/5]"
          >
            <Link href={slide.href} className="relative block h-full w-full">
              <Image
                src={slide.src}
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
    </section>
  );
}
