"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { QuickViewShare } from "@/components/product/QuickViewShare";
import { useQuickViewStore } from "@/lib/store/useQuickViewStore";
import { fetchQuickViewProduct } from "@/lib/wpgraphql/actions";
import { formatPrice } from "@/lib/utils/formatPrice";

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Quick-view popup (reference: WoodMart quick view). Opens instantly with the
 * card's own data, then fills in the gallery, short description and
 * categories from one on-demand request. RTL layout: image slider on the
 * right, details on the left (title, brand logo, price, short description,
 * qty + add to cart, hr, SKU, categories, share).
 */
export function QuickViewModal({ product: cardProduct }: { product: Product }) {
  const close = useQuickViewStore((s) => s.close);
  const [detail, setDetail] = useState<Product | null>(null);
  // The product id the current `detail` request finished for — loading is
  // derived from it rather than a flag flipped early.
  const [detailFor, setDetailFor] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchQuickViewProduct(cardProduct.databaseId)
      .then((p) => {
        if (cancelled) return;
        setDetail(p);
        setDetailFor(cardProduct.databaseId);
      })
      .catch(() => {
        if (!cancelled) setDetailFor(cardProduct.databaseId);
      });
    return () => {
      cancelled = true;
    };
  }, [cardProduct.databaseId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  const loading = detailFor !== cardProduct.databaseId;
  const product = detail ?? cardProduct;
  const images = product.images.length > 0 ? product.images : cardProduct.images;
  const current = images[Math.min(slide, images.length - 1)];
  const productUrl = `/product/${cardProduct.slug}`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${productUrl}` : productUrl;
  const onSale = product.onSale && product.salePrice;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[15px]">
      <div className="absolute inset-0 bg-black/70" onClick={close} aria-hidden />

      <button
        type="button"
        onClick={close}
        aria-label="סגירה"
        className="absolute top-[15px] left-[15px] z-10 flex h-[40px] w-[40px] items-center justify-center text-white md:top-[30px] md:left-[30px]"
      >
        <X className="h-8 w-8 stroke-[1.5]" />
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={cardProduct.name}
        className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-y-auto bg-white md:h-[510px] md:flex-row md:overflow-hidden"
      >
        {/* Image slider — right column (first in RTL). */}
        <div className="group relative aspect-square w-full shrink-0 overflow-hidden bg-white md:aspect-auto md:h-full md:w-1/2">
          {current ? (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt || cardProduct.name}
              fill
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-contain p-[15px]"
              priority
            />
          ) : null}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setSlide((i) => (i + 1) % images.length)}
                aria-label="התמונה הבאה"
                className="absolute top-1/2 left-[15px] flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center bg-[#fde7eb] text-[#333] shadow-sm transition-colors hover:bg-[#f3c3cc]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setSlide((i) => (i - 1 + images.length) % images.length)}
                aria-label="התמונה הקודמת"
                className="absolute top-1/2 right-[15px] flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center bg-[#fde7eb] text-[#333] shadow-sm transition-colors hover:bg-[#f3c3cc]"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <Link
            href={productUrl}
            onClick={close}
            className="absolute inset-x-[15px] bottom-[15px] z-10 flex h-[45px] translate-y-[calc(100%+15px)] items-center justify-center bg-[#f3c3cc] text-lg font-semibold text-[#333] transition-transform duration-300 group-hover:translate-y-0 focus-visible:translate-y-0 [@media(hover:none)]:translate-y-0"
          >
            לצפייה בפרטים
          </Link>
        </div>

        {/* Details — left column. */}
        <div className="flex w-full flex-col p-[20px] text-right md:h-full md:w-1/2 md:overflow-y-auto md:p-[30px]">
          <h2 className="text-[24px] leading-[1.25] font-normal text-[#242424]">{decodeHtml(cardProduct.name)}</h2>

          {product.brandLogoUrl ? (
            <Image
              src={product.brandLogoUrl}
              alt={product.brand ?? ""}
              width={100}
              height={40}
              className="mt-[15px] h-[40px] w-auto max-w-[140px] object-contain object-right"
            />
          ) : null}

          <div className="mt-[15px] flex flex-wrap items-baseline gap-x-[10px]">
            {onSale ? (
              <>
                <span className="text-[28px] leading-[1.2] font-bold text-[#d52027]">{formatPrice(product.salePrice!)}</span>
                <span className="text-lg font-bold text-[#333] line-through decoration-1 decoration-black/40 [unicode-bidi:isolate]">{formatPrice(product.regularPrice)}</span>
              </>
            ) : (
              <span className="text-[28px] leading-[1.2] font-bold text-[#d52027]">{formatPrice(product.price)}</span>
            )}
          </div>

          {loading ? (
            <div className="mt-[15px] animate-pulse space-y-2" aria-hidden>
              <div className="h-4 w-full rounded-full bg-black/5" />
              <div className="h-4 w-full rounded-full bg-black/5" />
              <div className="h-4 w-2/3 rounded-full bg-black/5" />
            </div>
          ) : product.shortDescription ? (
            <div
              className="mt-[15px] text-lg leading-[1.6] text-[#333] [&_p]:mb-[10px]"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          ) : null}

          <div className="mt-[20px] flex flex-wrap items-center gap-[10px]">
            {cardProduct.type === "simple" ? (
              <>
                <QuantityStepper quantity={quantity} onChange={setQuantity} size="sm" />
                <AddToCartButton
                  productId={cardProduct.databaseId}
                  inStock={product.inStock}
                  quantity={quantity}
                  size="sm"
                />
              </>
            ) : (
              <Link
                href={productUrl}
                onClick={close}
                className="block w-full rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]"
              >
                לצפייה במוצר
              </Link>
            )}
          </div>

          <hr className="my-[20px] border-black/10" />

          <div className="space-y-[6px] text-lg text-[#333]">
            {product.sku ? (
              <p>
                <span className="font-semibold">מק&quot;ט:</span> {product.sku}
              </p>
            ) : null}
            {product.categories.length > 0 ? (
              <p>
                <span className="font-semibold">קטגוריות:</span>{" "}
                {product.categories.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 ? ", " : ""}
                    <Link
                      href={`/product-category/${c.slug}/`}
                      onClick={close}
                      className="transition-colors hover:text-[#d52027]"
                    >
                      {decodeHtml(c.name)}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="mt-[15px]">
            <QuickViewShare url={shareUrl} title={cardProduct.name} image={current?.src} />
          </div>
        </div>
      </div>
    </div>
  );
}
