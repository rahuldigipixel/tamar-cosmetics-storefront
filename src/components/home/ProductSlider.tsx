"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import { CategoryProductCard } from "@/components/product/CategoryProductCard";

export function ProductSlider({
  title,
  description,
  products,
  autoplayMs,
  compact = false,
}: {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  description?: string;
  products: Product[];
  headerVariant?: "classic" | "modern";
  autoplayMs?: number;
  /** Product-page rails: heading sized like Flashy's own widget heading, tighter padding. */
  compact?: boolean;
}) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<Product, HTMLDivElement>({ items: products, autoplayMs });

  if (products.length === 0) return null;

  return (
    <section className={`mx-auto max-w-[1600px] px-[15px] ${compact ? "py-[25px]" : "py-[70px]"}`}>
      {/* Centered heading */}
      <div className="mb-7 text-center">
        <h2
          className={
            compact
              ? "text-[26px] leading-[1.3] font-bold text-[#000]"
              : "text-[72px] font-black leading-none tracking-tight text-[#000] sm:text-[72px]"
          }
        >
          {title}
        </h2>
        {description ? <p className="mt-3 text-[23px] text-black/100">{description}</p> : null}
      </div>

      {/* Slider with arrows on left/right sides */}
      <div className="relative">
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="absolute -start-13 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="overflow-clip [overflow-clip-margin:14px]">
          <div
            ref={trackRef}
            className="-mx-[12px] -mt-[12px] flex snap-x snap-mandatory gap-[15px] overflow-x-auto px-[12px] pt-[12px] pb-[16px] [scroll-padding-inline:12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="w-[calc((100%-15px)/2)] shrink-0 snap-start self-stretch sm:w-[calc((100%-30px)/3)] lg:w-[calc((100%-60px)/5)]"
              >
                <CategoryProductCard product={product} standalone />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="absolute -end-13 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
