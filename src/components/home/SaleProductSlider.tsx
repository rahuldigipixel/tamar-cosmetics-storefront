"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Percent } from "lucide-react";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { formatPrice } from "@/lib/utils/formatPrice";

const COPIES = 5;
const RECENTER_DELAY_MS = 500;

/**
 * Center-focus ("coverflow") carousel: unlike the shared useInfiniteCarousel
 * hook (which aligns the stepped item to the row's start edge), this keeps
 * the active card centered in the track so neighbors peek evenly on both
 * sides — the visual the sale section asked for. Kept local to this file
 * since it's a one-off interaction, not a pattern to share yet.
 */
function useCenterCarousel<Item>(items: Item[], autoplayMs?: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = items.length;
  const middleStart = count * Math.floor(COPIES / 2);
  const looped = count > 0 ? Array.from({ length: COPIES }, () => items).flat() : [];
  const position = useRef(middleStart);

  function centerItem(target: number, smooth: boolean) {
    const container = trackRef.current;
    const item = itemRefs.current[target];
    if (!container || !item) return;
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const delta = itemRect.left + itemRect.width / 2 - (containerRect.left + containerRect.width / 2);
    container.scrollBy({ left: delta, behavior: smooth ? "smooth" : "auto" });
  }

  function step(direction: 1 | -1) {
    if (count === 0) return;
    const next = position.current + direction;
    position.current = next;
    centerItem(next, true);

    const middleEnd = middleStart + count - 1;
    if (next < middleStart || next > middleEnd) {
      window.setTimeout(() => {
        const recentered = middleStart + (((next - middleStart) % count) + count) % count;
        position.current = recentered;
        centerItem(recentered, false);
      }, RECENTER_DELAY_MS);
    }
  }

  useEffect(() => {
    centerItem(position.current, false);
    // Only on mount — jumps the track to the middle copy before first paint settles.
  }, []);

  useEffect(() => {
    if (!autoplayMs) return;
    const timer = setInterval(() => step(1), autoplayMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs]);

  // Marks whichever card sits nearest the track's visual center as
  // "focused" (full size) — every other card gets one flat, equal side
  // size instead of continuously shrinking the further it drifts.
  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;
    let raf = 0;

    function update() {
      const containerRect = container!.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      itemRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const norm = Math.min(1, Math.abs(elCenter - centerX) / (containerRect.width / 2));
        const focused = norm < 0.15;
        el.style.transform = `scale(${focused ? 1 : 0.82})`;
        el.style.opacity = focused ? "1" : "0.75";
        el.style.zIndex = focused ? "10" : "1";
        el.style.borderColor = focused ? "rgba(213,32,39,0.35)" : "";
        el.style.borderWidth = focused ? "2px" : "1px";
        el.style.boxShadow = focused ? "0 20px 40px -20px rgba(213,32,39,0.25)" : "";
      });
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [looped.length]);

  return { trackRef, itemRefs, looped, step };
}


function SaleProductCard({ product, cardRef }: { product: Product; cardRef: (el: HTMLDivElement | null) => void }) {
  const [quantity, setQuantity] = useState(1);
  const image = product.images[0];
  const discountPercent =
    product.onSale && product.salePrice
      ? Math.round((1 - Number(product.salePrice) / Number(product.regularPrice)) * 100)
      : null;

  return (
    <div
      ref={cardRef}
      className="group flex w-full shrink-0 snap-center flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/40 shadow-xl backdrop-blur-md transition-[transform,opacity,box-shadow,border-color] duration-300 ease-out sm:w-[calc((100%-0.5rem)/3)] lg:w-[calc((100%-1rem)/5)]"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full bg-brand-accent/5">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {discountPercent ? (
          <span className="absolute top-3 end-3 flex items-center gap-1 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Percent className="h-3 w-3" />
            {discountPercent}%-
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 text-right">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.8em] text-sm font-medium text-black/80 group-hover:text-brand-accent"
        >
          {product.name}
        </Link>

        <span className="text-xs text-black/60">{product.sku ? `מק"ט: ${product.sku}` : " "}</span>

        <div className="mt-1 flex items-baseline gap-2 rounded-lg bg-brand-accent/5 px-2 py-1">
          {product.onSale && product.salePrice ? (
            <>
              <span className="text-lg font-bold text-brand-accent">{formatPrice(product.salePrice)}</span>
              <span className="text-sm text-black/40 line-through">{formatPrice(product.regularPrice)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-brand-accent">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-center gap-2 pt-2">
          {product.type === "simple" ? (
            <>
              <QuantityStepper quantity={quantity} onChange={setQuantity} size="sm" />
              <AddToCartButton
                productId={product.databaseId}
                inStock={product.inStock}
                quantity={quantity}
                size="sm"
              />
            </>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="block w-full rounded-full border border-brand-accent/20 px-6 py-3 text-center text-sm font-semibold text-black/80 transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              לצפייה במוצר
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone sale-only carousel — kept separate from ProductSlider so its
 * header/card treatment can diverge freely without touching the shared
 * best-sellers/new-arrivals slider. Uses a center-focus "coverflow" track
 * instead of the plain grid-row carousel the other sliders use, so this
 * section reads as visually distinct at a glance.
 */
export function SaleProductSlider({
  badge,
  badgeIcon,
  title,
  description,
  products,
}: {
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  description?: string;
  products: Product[];
}) {
  const { trackRef, itemRefs, looped, step } = useCenterCarousel(products, 7000);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-[50px]">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-brand-accent px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
          {badgeIcon}
          {badge}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">{title}</h2>
        {description ? <p className="max-w-xl text-sm text-black/60 sm:text-lg">{description}</p> : null}
      </div>

      {/* Nav buttons sit back inside the carousel's own box — pinned to
          its inner edges — instead of out in the page's side margins. */}
      <div className="relative mx-auto mt-8 px-4 sm:mt-10 sm:max-w-[81rem] sm:px-0 lg:max-w-[91rem]">
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="absolute inset-y-0 start-2 z-20 hidden h-12 w-12 items-center justify-center self-center rounded-full border border-black/10 bg-white text-black/70 shadow-md transition-all hover:-translate-y-0.5 hover:text-brand-accent sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="absolute inset-y-0 end-2 z-20 hidden h-12 w-12 items-center justify-center self-center rounded-full border border-black/10 bg-white text-black/70 shadow-md transition-all hover:-translate-y-0.5 hover:text-brand-accent sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={trackRef}
          className="flex w-full min-w-0 snap-x snap-mandatory items-center gap-1 overflow-x-auto px-2 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {looped.map((product, i) => (
            <SaleProductCard
              key={`${product.id}-${i}`}
              product={product}
              cardRef={(el) => {
                itemRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-3 sm:hidden">
        <button
          onClick={() => step(-1)}
          aria-label="הקודם"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => step(1)}
          aria-label="הבא"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
