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
// Space under each product row (inside the row's own box, so scrolling stays on exact row boundaries).
const ROW_GAP = 28;
// First-paint window height until the real rows are measured (legacy-site sizing, approved product-page exception to the 18px floor).
const VIEW_FALLBACK = 262;
// The list is rendered 4× so a 2-row step from anywhere in the second copy never runs off the end.
const COPIES = 4;

/** Slider-only quantity box: compact, squarish, with vertical partition lines between − / number / +; sits on one line with the cart icon. */
function SliderQuantity({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  const btn = "flex h-full w-6 items-center justify-center text-black/60 transition-colors hover:text-brand-accent";
  return (
    <div className="flex h-9 items-center divide-x divide-black/15 overflow-hidden rounded-[6px] border border-black/15">
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} aria-label="הפחת כמות" className={btn}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex h-full w-6 items-center justify-center text-[14px] leading-none font-semibold tabular-nums">{quantity}</span>
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
    <li data-row className="flex items-start gap-[10px] text-right" style={{ paddingBottom: ROW_GAP }}>
      {product.image ? (
        <Link href={href} className="shrink-0" aria-label={product.name}>
          <Image src={product.image.url} alt={product.image.alt || product.name} width={80} height={80} className="h-[70px] w-[70px] object-contain" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-2 text-[15px] leading-[16px] text-[#000] hover:text-brand-accent">
          {product.name}
        </Link>
        <FlashyStarRating rating={product.averageRating} count={product.reviewCount} className="mt-[4px]" />

        <div className="mt-[8px] flex items-center justify-between gap-[6px]">
          {/* RTL: price + SKU on the right, cart controls on the left. */}
          <div className="flex h-9 shrink-0 flex-col justify-between">
            <p className="flex items-baseline gap-[6px] whitespace-nowrap">
              <span className="text-[17px] leading-[19px] font-bold text-[#d52027]"><Price value={price} symbolSize={14} family="inherit" /></span>
              {product.onSale && product.salePrice ? (
                <span className="text-[12px]  leading-[19px] text-[#646464] line-through decoration-1 decoration-black/20 [unicode-bidi:isolate]">{formatPrice(product.regularPrice)}</span>
              ) : null}
            </p>
            {product.sku ? <p className="text-[12px] leading-[14px] text-black">מק&quot;ט: {product.sku}</p> : null}
          </div>
          {product.purchasable ? (
            <div className="flex shrink-0 items-center gap-[6px]">
              {product.inStock ? <SliderQuantity quantity={quantity} onChange={setQuantity} /> : null}
              <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size="stripe" />
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
  const listRef = useRef<HTMLUListElement>(null);
  const scrollable = products.length > VISIBLE;
  // Rows keep their natural height (title lines / reviews / button differ per product) so there is no dead space inside a row.
  // setHeight = one full copy of the list; viewHeight = exactly the two rows currently shown, so no third product ever peeks in.
  const [setHeight, setSetHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(VIEW_FALLBACK);

  function rowEls(): HTMLElement[] {
    return Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-row]") ?? []);
  }
  const offsetsOf = (rows: HTMLElement[]) => rows.map((r) => r.offsetTop - rows[0].offsetTop);
  /** Height of the window that shows rows idx .. idx + VISIBLE - 1 (minus the trailing gap). */
  function windowFor(rows: HTMLElement[], offsets: number[], idx: number) {
    const last = Math.min(idx + Math.min(VISIBLE, products.length), rows.length) - 1;
    return offsets[last] + rows[last].offsetHeight - offsets[idx] - ROW_GAP;
  }
  function nearest(offsets: number[], y: number) {
    let idx = 0;
    offsets.forEach((o, i) => {
      if (Math.abs(o - y) < Math.abs(offsets[idx] - y)) idx = i;
    });
    return idx;
  }

  useLayoutEffect(() => {
    function measure() {
      const rows = rowEls();
      if (rows.length === 0) return;
      const offsets = offsetsOf(rows);
      const n = products.length;
      const el = viewport.current;
      const sh = scrollable ? offsets[n] : 0;
      setSetHeight(sh);
      const idx = scrollable && el && el.scrollTop >= sh ? nearest(offsets, el.scrollTop) : scrollable ? n : 0;
      setViewHeight(windowFor(rows, offsets, idx));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Start on the second copy so there is content both above and below (re-anchored if the measurements change).
  useLayoutEffect(() => {
    if (scrollable && viewport.current) viewport.current.scrollTop = setHeight;
  }, [scrollable, setHeight]);

  function step(dir: 1 | -1) {
    const el = viewport.current;
    if (!el) return;
    // Copies are identical, so snapping back into the second one is invisible — that is what makes the loop endless.
    if (el.scrollTop < setHeight) el.scrollTop += setHeight;
    else if (el.scrollTop >= setHeight * 2) el.scrollTop -= setHeight;
    // Land on a row boundary even if clicks arrive mid-animation, and resize the window to the pair it lands on.
    const rows = rowEls();
    const offsets = offsetsOf(rows);
    const next = Math.min(Math.max(nearest(offsets, el.scrollTop) + dir * VISIBLE, 0), rows.length - 1);
    setViewHeight(windowFor(rows, offsets, next));
    el.scrollTo({ top: offsets[next], behavior: "smooth" });
  }

  // Same box + icon size for the top and bottom arrows.
  const chevron = "mx-auto flex h-[32px] w-[48px] items-center justify-center text-black transition-colors hover:text-brand-accent";
  const copies = scrollable ? COPIES : 1;

  return (
    <section className="mx-auto w-full max-w-[336px] rounded-[12px] border border-[#F3C3CC] bg-white px-[10px] pt-[10px] pb-[12px] text-right md:mx-0" aria-label="מוצרים קשורים">
      <h2 className="text-center text-[21px] leading-[34px] font-semibold text-[#d52027]">מוצרים קשורים</h2>

      {scrollable ? (
        <button type="button" onClick={() => step(-1)} aria-label="הקודם" className={chevron}>
          <ChevronUp className="h-8 w-8" strokeWidth={3} />
        </button>
      ) : null}

      <div ref={viewport} className="mt-[8px] mb-[2px] overflow-hidden transition-[height] duration-300 ease-out" style={{ height: viewHeight }}>
        <ul ref={listRef}>
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
