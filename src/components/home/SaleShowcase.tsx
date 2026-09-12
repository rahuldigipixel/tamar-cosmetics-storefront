"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { useInfiniteCarousel } from "@/lib/utils/useInfiniteCarousel";
import { formatPrice } from "@/lib/utils/formatPrice";

export function SaleShowcase({ products }: { products: Product[] }) {
  const { trackRef, itemRefs, looped, step } = useInfiniteCarousel<Product, HTMLDivElement>({
    items: products,
    autoplayMs: 6000,
  });

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:py-[50px] sm:px-6">
      <div className="grid overflow-hidden rounded-3xl shadow-lg md:grid-cols-2">
        {/* CTA side */}
        <div className="relative flex flex-col justify-center gap-4 overflow-hidden bg-gradient-to-br from-brand-primary via-black to-brand-accent px-6 py-10 text-white sm:gap-5 sm:px-12 sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-brand-accent/30 blur-3xl"
          />
          <span className="relative flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            מבצעי הקיץ
          </span>
          <h2 className="relative max-w-xs text-3xl font-bold leading-tight sm:text-4xl">
            הזדמנות שלא <span className="text-brand-accent">חוזרת</span>
          </h2>
          <p className="relative max-w-sm text-sm text-white/70 sm:text-base">
            מגוון מוצרים נבחרים במחירים מיוחדים — לזמן מוגבל ובכמות מוגבלת בלבד.
          </p>
          <Link
            href="/shop?sale=1"
            className="relative mt-2 w-fit rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            לכל המבצעים
          </Link>
        </div>

        {/* Sale carousel side */}
        <div className="relative min-h-[340px] bg-brand-soft/30 md:min-h-0">
          {products.length > 0 ? (
            <>
              <div
                ref={trackRef}
                className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {looped.map((product, i) => {
                  const image = product.images[0];
                  return (
                    <div
                      key={`${product.id}-${i}`}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      className="flex w-full shrink-0 snap-start flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:gap-4 sm:px-8 sm:py-10"
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        {image ? (
                          <Image
                            src={image.src}
                            alt={image.alt || product.name}
                            fill
                            sizes="240px"
                            className="object-contain p-4"
                          />
                        ) : null}
                        {product.onSale ? (
                          <span className="absolute top-3 end-3 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-semibold text-white">
                            מבצע
                          </span>
                        ) : null}
                      </Link>

                      <Link
                        href={`/product/${product.slug}`}
                        className="line-clamp-2 max-w-xs text-sm font-medium text-black/80 hover:text-brand-accent"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-baseline gap-2">
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-brand-accent">
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-sm text-black/40 line-through">
                              {formatPrice(product.regularPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {products.length > 1 ? (
                <>
                  <button
                    onClick={() => step(-1)}
                    aria-label="הקודם"
                    className="absolute inset-y-0 start-2 flex items-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-brand-soft">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => step(1)}
                    aria-label="הבא"
                    className="absolute inset-y-0 end-2 flex items-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-brand-soft">
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center px-8 text-center text-sm text-black/50">
              אין כרגע מוצרים במבצע.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
