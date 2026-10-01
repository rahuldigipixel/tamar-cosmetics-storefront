"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { FlashyStarRating } from "@/components/product/FlashyStarRating";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { SliderProduct } from "@/types/product";

const VISIBLE = 2;
// Fixed row height so a click moves exactly two products (legacy-site sizing, approved product-page exception to the 18px floor).
const ROW_HEIGHT = 140;
// The list is rendered 4× so a 2-row step from anywhere in the second copy never runs off the end.
const COPIES = 4;

function LinkedProductRow({ product }: { product: SliderProduct }) {
  const [quantity, setQuantity] = useState(1);
  const href = `/product/${product.slug}`;
  const price = product.onSale && product.salePrice ? product.salePrice : product.price;

  return (
    <li className="flex items-start gap-[10px] py-[8px] text-right" style={{ height: ROW_HEIGHT }}>
      {product.image ? (
        <Link href={href} className="shrink-0" aria-label={product.name}>
          <Image src={product.image.url} alt={product.image.alt || product.name} width={80} height={80} className="h-[70px] w-[70px] object-contain" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-2 text-[15px]  text-[#000] hover:text-brand-accent">
          {product.name}
        </Link>
        <FlashyStarRating productId={product.databaseId} className="mt-[4px] min-h-[20px]" />

        <div className="mt-[8px] flex items-center justify-between gap-[6px]">
          {/* RTL: price + SKU on the right, cart controls on the left. */}
          <div className="shrink-0">
            <p className="flex flex-nowrap items-baseline gap-x-[8px] whitespace-nowrap leading-[22px]">
              <span className="text-[18px] font-bold text-brand-accent">{formatPrice(price)}</span>
              {product.onSale && product.salePrice ? (
                <span className="text-[18px] font-bold text-[#333] line-through decoration-1 decoration-black/40 [unicode-bidi:isolate]">{formatPrice(product.regularPrice)}</span>
              ) : null}
            </p>
            {product.sku ? <p className="mt-[4px] text-[16px] leading-[22px] text-[#242424]">מק&quot;ט: {product.sku}</p> : null}
          </div>
          {product.purchasable ? (
            <div className="flex items-center gap-[6px]">              
              {product.inStock ? <QuantityStepper quantity={quantity} onChange={setQuantity} size="mini" /> : null}
              <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size="sm" />
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

  const chevron = "mx-auto flex h-[32px] w-[48px] items-center justify-center text-black transition-colors hover:text-brand-accent";
  const copies = scrollable ? COPIES : 1;

  return (
    <section className="mx-auto w-full max-w-[335px] rounded-[20px] border border-[#f1c1c9] bg-white px-[20px] py-[18px] text-right md:mx-0" aria-label="מוצרים קשורים">
      <h2 className="text-center text-[21px] leading-[34px] font-semibold text-brand-accent">מוצרים קשורים</h2>

      {scrollable ? (
        <button type="button" onClick={() => step(-1)} aria-label="הקודם" className={`${chevron} mt-[8px]`}>
          <ChevronUp className="h-6 w-6" strokeWidth={3} />
        </button>
      ) : null}

      <div ref={viewport} className="mt-[4px] overflow-hidden" style={{ height: ROW_HEIGHT * Math.min(VISIBLE, products.length) }}>
        <ul>
          {Array.from({ length: copies }, (_, c) =>
            products.map((p) => <LinkedProductRow key={`${c}-${p.databaseId}`} product={p} />)
          )}
        </ul>
      </div>

      {scrollable ? (
        <button type="button" onClick={() => step(1)} aria-label="הבא" className={chevron}>
          <ChevronDown className="h-6 w-6" strokeWidth={3} />
        </button>
      ) : null}
    </section>
  );
}
