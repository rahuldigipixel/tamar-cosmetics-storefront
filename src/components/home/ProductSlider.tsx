"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import { ProductGridCard } from "@/components/product/ProductGridCard";

const CARD_WIDTH_CLASSNAME = "snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]";

/**
 * Reusable horizontally-scrolling product carousel with a stylized gradient
 * header — backs every product-list section on the homepage (best sellers,
 * new arrivals, on-sale) so they stay visually and behaviorally consistent
 * instead of three near-duplicate components.
 */
export function ProductSlider({
  badge,
  badgeIcon,
  title,
  description,
  products,
  headerVariant = "classic",
}: {
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  description?: string;
  products: Product[];
  headerVariant?: "classic" | "modern";
}) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<Product, HTMLDivElement>({
    items: products,
  });

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:py-[50px] sm:px-6">
      {headerVariant === "modern" ? (
        <div className="relative mb-10 overflow-hidden rounded-[2rem] sm:mb-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-l from-brand-accent/25 via-brand-soft to-brand-primary/20">
            <div className="absolute -top-16 -start-16 h-64 w-64 rounded-full bg-brand-accent/40 blur-3xl" />
            <div className="absolute top-1/2 start-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/60 blur-3xl" />
            <div className="absolute -bottom-16 -end-16 h-64 w-64 rounded-full bg-brand-primary/40 blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between gap-4 overflow-hidden border border-white/50 bg-white/40 px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-10 sm:py-10">
            <div className="relative min-w-0">
              <span className="flex w-fit items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/60 backdrop-blur-sm sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-[0.2em]">
                {badgeIcon}
                {badge}
              </span>
              <h2 className="mt-2 max-w-2xl truncate text-xl font-semibold leading-[1.15] tracking-tight text-black sm:mt-4 sm:whitespace-nowrap sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 max-w-xl truncate text-sm text-black/60 sm:mt-4 sm:text-lg">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => step(-1)}
                aria-label="הקודם"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/60 text-black/70 backdrop-blur-sm transition-all hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="הבא"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/60 text-black/70 backdrop-blur-sm transition-all hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-l from-brand-primary via-black to-brand-accent px-6 py-8 text-white sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-14 -end-14 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {badgeIcon}
                {badge}
              </span>
              <h2 className="relative mt-3 max-w-lg text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
              {description ? (
                <p className="relative mt-2 max-w-xl text-sm text-white/70 sm:text-base">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => step(-1)}
                aria-label="הקודם"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="הבא"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((product, i) => (
          <ProductGridCard
            key={`${product.id}-${i}`}
            product={product}
            widthClassName={CARD_WIDTH_CLASSNAME}
            cardRef={(el) => {
              itemRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}
