"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import { CategoryProductCard } from "@/components/product/CategoryProductCard";

export function SaleShowcase({ products }: { products: Product[] }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<Product, HTMLDivElement>({
    items: products,
    autoplayMs: 6000,
  });

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-[15px] py-[50px]">
      <div className="mb-7 text-center">
        <h2 className="text-[72px] font-black leading-none tracking-tight text-[#000]">SALE</h2>
        <p className="mt-3 text-[23px] text-black/100">המבצעים שלנו:</p>
      </div>

      <div className="relative">
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="absolute start-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="overflow-hidden px-12">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-[15px] overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="w-[calc((100%-15px)/2)] shrink-0 snap-start self-stretch sm:w-[calc((100%-30px)/3)] lg:w-[calc((100%-45px)/4)]"
              >
                <CategoryProductCard product={product} standalone />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="absolute end-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
