"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCategory } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";

export function CategorySlider({ categories }: { categories: ProductCategory[] }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<ProductCategory, HTMLAnchorElement>({
    items: categories,
    stepSize: 2,
  });

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:py-[50px] sm:px-6">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">בחרו לפי צורך</span>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">קטגוריות</h2>
        </div>
        <div className="flex gap-2">
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
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((category, i) => (
          <Link
            key={`${category.id}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={`/shop/${category.slug}`}
            className="group flex w-[calc((100%-1rem)/2)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]"
          >
            <div className="relative aspect-square w-full bg-brand-soft/40 p-4">
              <Image
                src={category.image || "/brand/logo.png"}
                alt={category.name}
                fill
                sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="border-t border-black/5 px-3 py-3 text-center text-sm font-medium text-black/80 group-hover:text-brand-accent">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
