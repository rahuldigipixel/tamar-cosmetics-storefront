"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { FlashyStarRating } from "@/components/product/FlashyStarRating";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Price } from "@/components/product/Price";
import type { SliderProduct } from "@/types/product";

const VISIBLE = 2;
// Fixed row height so a click moves exactly two products (legacy-site sizing, approved product-page exception to the 18px floor).
const ROW_HEIGHT = 140;
// The list is rendered 4× so a 2-row step from anywhere in the second copy never runs off the end.
const COPIES = 4;

/** Slider-only quantity box: squarish (small radius) with vertical partition lines between − / number / +. */
function SliderQuantity({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  const btn = "flex h-full w-8 items-center justify-center text-black/60 transition-colors hover:text-brand-accent";
  return (
    <div className="flex h-8 w-full items-center divide-x divide-black/15 overflow-hidden rounded-[6px] border border-black/15">
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} aria-label="הפחת כמות" className={btn}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex h-full flex-1 items-center justify-center text-[14px] leading-none font-semibold tabular-nums">{quantity}</span>
      <button type="button" onClick={() => onChange(Math.min(99, quantity + 1))} aria-label="הוסף כמות" className={btn}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function LinkedProductRow({ product }: { product: SliderProduct }) {
  const [quantity, setQuantity] = useState(1);
  const href = `/product/${product.slug}`;
  const price = product.onSale && product.salePrice ? product.salePrice : product.price;

  return (
    <li className="flex items-start gap-[10px] pt-[4px] pb-[16px] text-right" style={{ height: ROW_HEIGHT }}>
      {product.image ? (
        <Link href={href} className="shrink-0" aria-label={product.name}>
          <Image src={product.image.url} alt={product.image.alt || product.name} width={80} height={80} className="h-[70px] w-[70px] object-contain" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-2 text-[15px] leading-[16px] text-[#000] hover:text-brand-accent">
          {product.name}
        </Link>
        <FlashyStarRating rating={product.averageRating} count={product.reviewCount} className="mt-[4px] min-h-[22px]" />

        <div className="mt-[8px] flex items-center justify-between gap-[4px]">
          {/* RTL: price + SKU on the right, cart controls on the left. */}
          <div className="shrink-0">
            <p className="flex flex-col whitespace-nowrap leading-[22px]">
              <span className="text-[17px] leading-[19px] font-bold text-[#d52027]"><Price value={price} symbolSize={14} family="inherit" /></span>
              {product.onSale && product.salePrice ? (
                <span className="text-[12px] font-bold leading-[18px] text-[#333] line-through decoration-1 decoration-black/40 [unicode-bidi:isolate]">{formatPrice(product.regularPrice)}</span>
              ) : null}
            </p>
            {product.sku ? <p className="mt-[4px] text-[12px] leading-[18px] text-black">מק&quot;ט: {product.sku}</p> : null}
          </div>
          {product.purchasable ? (
            <div className="flex w-[100px] shrink-0 flex-col items-center gap-[4px]">
              {product.inStock ? <SliderQuantity quantity={quantity} onChange={setQuantity} /> : null}
              <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size="slider" />
            </div>
          ) : (
            <Link href={href} className="rounded-full bg-[#f3c3cc] px-[10px] py-[6px] text-[14px] font-semibold text-[#333] transition-colors hover:bg-[#eeb0bb]">
              בחירת אפשרויות
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

/** "מוצרים קשורים" — endless vertical slider (2 products per step) of the products picked in the product edit screen, shown above the Tamar tip. */
export function LinkedProductsSlider({ products }: { products: SliderProduct[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const scrollable = products.length > VISIBLE;
  const setHeight = products.length * ROW_HEIGHT;

  // Start on the second copy so there is content both above and below.
  useLayoutEffect(() => {
    if (scrollable && viewport.current) viewport.current.scrollTop = setHeight;
  }, [scrollable, setHeight]);

  function step(dir: 1 | -1) {
    const el = viewport.current;
    if (!el) return;
    // Copies are identical, so snapping back into the second one is invisible — that is what makes the loop endless.
    if (el.scrollTop < setHeight) el.scrollTop += setHeight;
    else if (el.scrollTop >= setHeight * 2) el.scrollTop -= setHeight;
    el.scrollBy({ top: dir * VISIBLE * ROW_HEIGHT, behavior: "smooth" });
  }

  // Same box + icon size for the top and bottom arrows.
  const chevron = "mx-auto flex h-[32px] w-[48px] items-center justify-center text-black transition-colors hover:text-brand-accent";
  const copies = scrollable ? COPIES : 1;

  return (
    <section className="mx-auto w-full max-w-[336px] rounded-[12px] border border-[#F3C3CC] bg-white px-[10px] pt-[10px] pb-0 text-right md:mx-0" aria-label="מוצרים קשורים">
      <h2 className="text-center text-[21px] leading-[34px] font-semibold text-[#d52027]">מוצרים קשורים</h2>

      {scrollable ? (
        <button type="button" onClick={() => step(-1)} aria-label="הקודם" className={chevron}>
          <ChevronUp className="h-8 w-8" strokeWidth={3} />
        </button>
      ) : null}

      <div ref={viewport} className="mt-[8px] mb-[8px] overflow-hidden" style={{ height: ROW_HEIGHT * Math.min(VISIBLE, products.length) }}>
        <ul>
          {Array.from({ length: copies }, (_, c) =>
            products.map((p) => <LinkedProductRow key={`${c}-${p.databaseId}`} product={p} />)
          )}
        </ul>
      </div>

      {scrollable ? (
        <button type="button" onClick={() => step(1)} aria-label="הבא" className={chevron}>
          <ChevronDown className="h-8 w-8" strokeWidth={3} />
        </button>
      ) : null}
    </section>
  );
}
