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
  sectionPadding = "pb-0 pt-[50px] md:pt-[60px]",
  singleOnMobile = false,
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
  /** Vertical padding of the (non-compact) section. */
  sectionPadding?: string;
  /** Show one product per slide on mobile (default is two). */
  singleOnMobile?: boolean;
}) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<Product, HTMLDivElement>({ items: products, autoplayMs });

  if (products.length === 0) return null;

  return (
    <section className={`mx-auto max-w-[1600px] px-[15px] ${compact ? "py-[12px] md:py-[25px]" : sectionPadding}`}>
      {/* Centered heading */}
      <div className={`text-center ${compact ? "mb-7" : "mb-5"}`}>
        <h2
          className={
            compact
              ? "text-[26px] leading-[1.3] font-bold text-[#000]"
              : "text-[38px] font-extrabold leading-[38px] tracking-tight text-[#000] md:text-[72px] md:leading-[60px]"
          }
        >
          {title}
        </h2>
        {description ? <p className={`${compact ? "text-[23px] leading-[37px]" : "text-[18px] leading-[18px] md:text-[23px] md:leading-[37px]"} font-normal text-black ${compact ? "mt-3" : "mt-5"}`}>{description}</p> : null}
      </div>

      {/* Slider with arrows on left/right sides */}
      <div className="relative">
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="absolute -start-13 max-md:-start-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="overflow-clip [overflow-clip-margin:2px]">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`${compact || singleOnMobile ? "w-full" : "w-1/2"} shrink-0 snap-start self-stretch sm:w-1/3 lg:w-1/5 [&:not(:first-child)]:border-s [&:not(:first-child)]:border-black/10 max-sm:[&:not(:first-child)]:border-s-0`}
              >
                <CategoryProductCard product={product} standalone wideMobile={compact || singleOnMobile} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="absolute -end-13 max-md:-end-[11px] top-1/2 z-10 flex h-10 w-10 max-md:h-8 max-md:w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
