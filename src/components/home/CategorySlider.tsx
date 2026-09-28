"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCategory } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";

export function CategorySlider({ categories, heading }: { categories: ProductCategory[]; heading?: string }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<ProductCategory, HTMLAnchorElement>({
    items: categories,
    stepSize: 3,
  });

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (categories.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      step(1);
    }, 4000);

    return () => clearInterval(interval);
  }, [step, categories.length, isPaused]);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1550px] px-[15px] py-[70px]">
      {heading ? (
        <h2 className="mb-8 text-center text-[28px] font-bold text-[#242424] sm:text-[36px]">{heading}</h2>
      ) : null}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-clip [overflow-clip-margin:2px]">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-20 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((category, i) => (
              <Link
                key={`${category.id}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={`/product-category/${category.slug}/`}
                className="group flex shrink-0 snap-start flex-col items-center"
              >
                {/* Oval container locked to 160x235 with inner padding */}
                <div
                  className="relative flex items-center justify-center overflow-hidden bg-[#fde8ec] p-10"
                  style={{
                    width: 180,
                    height: 250,
                    borderRadius: "9999px",
                  }}
                >
                  {/* Inner relative container allowing the image to fill 100% cleanly */}
                  <div className="relative h-full w-full">
                    <Image
                      src={category.image || "/brand/logo.png"}
                      alt={category.name}
                      fill
                      sizes="160px"
                      className="object-contain transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Category Title aligned with 160px width */}
                <span className="mt-3.5 max-w-[160px] text-center text-[15px] font-semibold leading-snug text-black/80 group-hover:text-brand-accent">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}