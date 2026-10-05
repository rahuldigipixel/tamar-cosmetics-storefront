"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCategory } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";

export function CategorySlider({ categories, heading }: { categories: ProductCategory[]; heading?: string }) {
  // Mobile shows 2 categories per slide, so advance 2 at a time there; desktop keeps 3.
  const [stepSize, setStepSize] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setStepSize(mq.matches ? 2 : 3);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<ProductCategory, HTMLAnchorElement>({
    items: categories,
    stepSize,
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
    <section className="mx-auto max-w-[1550px] px-[15px] pb-0 pt-[50px] md:pt-[60px]">
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
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto md:gap-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((category, i) => (
              <Link
                key={`${category.id}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={`/product-category/${category.slug}/`}
                className="group flex w-[calc((100%-0.75rem)/2)] shrink-0 snap-start flex-col items-center md:w-auto"
              >
                {/* Mobile: oval fills half the row (2 per slide); desktop: locked 180x250 */}
                <div
                  className="relative flex aspect-[180/250] w-full items-center justify-center overflow-hidden rounded-full bg-[#fde8ec] p-8 md:h-[250px] md:w-[180px] md:p-10"
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
                <span className="mt-2 w-full text-center md:max-w-[180px] text-[18px] font-normal leading-[26px] md:text-[21px] md:leading-[34px] text-[#242424] group-hover:text-brand-accent">
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