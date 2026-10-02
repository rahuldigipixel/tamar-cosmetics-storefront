"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { FlashyStarRating } from "@/components/product/FlashyStarRating";
import { ProductHoverActions } from "@/components/product/ProductHoverActions";
import { ProductLabels } from "@/components/product/ProductLabels";
import { Price } from "@/components/product/Price";

function discountPercent(product: Product): number | null {
  if (!product.onSale || !product.salePrice) return null;
  const regular = Number(product.regularPrice);
  const sale = Number(product.salePrice);
  if (!regular || !sale || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

/**
 * Category/brand listing card, matching the reference product box
 * (WoodMart, measured at 1920px): shared 1px grid lines, 15px padding,
 * red "-N%" badge top-right with the brand logo under it, promo label
 * (e.g. "מבצע SALE") on the image's left, 15px title, red star rating,
 * 24px/700 red price with the struck-through regular price beside it, and
 * a 12px SKU line, then the site's existing quantity stepper + add-to-cart
 * button (unchanged design).
 */
export function CategoryProductCard({ product, standalone = false }: { product: Product; standalone?: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const image = product.images[0];
  const hoverImage = product.images[1];
  const discount = discountPercent(product);

  return (
    <div className={`group relative flex h-full flex-col bg-white p-[15px] text-right ${standalone ? "shadow-[0_1px_6px_rgba(0,0,0,0.04)]" : "border border-black/[.106] -mt-px -ml-px"}`}>
      {/* Wrapper (not the clipped Link) so a label's negative offset isn't cut off at the image edge. */}
      {/* Standalone (slider) cards run the image edge to edge: negative margins cancel the card's 15px padding. */}
      <div className={standalone ? "relative -mx-[15px] -mt-[15px]" : "relative"}>
        <Link prefetch={false} href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
              className="object-contain"
            />
          ) : null}
          {hoverImage ? (
            <Image
              src={hoverImage.src}
              alt={hoverImage.alt || product.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
              className="bg-white object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </Link>
        <ProductLabels html={product.labelsHtml?.image} />
      </div>
      <ProductLabels html={product.labelsHtml?.label} />

      {/* Top-right: discount badge, brand logo under it. */}
      <div className={`pointer-events-none absolute ${standalone ? "top-[6px] right-[6px]" : "top-[21px] right-[15px]"} flex flex-col gap-[5px] [&>*]:ml-auto`}>
        {discount ? (
          <span dir="ltr" className="bg-[#d52027] px-[10px] py-[2px] text-[12px] font-semibold leading-[14.4px] text-white">
            -{discount}%
          </span>
        ) : null}
        {product.brandLogoUrl ? (
          <Image
            src={product.brandLogoUrl}
            alt={product.brand ?? ""}
            width={100}
            height={24}
            className="h-[36px] w-auto max-w-[120px] object-contain object-right"
          />
        ) : null}
      </div>

      {/* Quick view + wishlist — shown on hover. */}
      <ProductHoverActions product={product} className={standalone ? "top-[11px] left-[6px]" : "top-[26px] left-[6px]"} />

      <Link prefetch={false}
        href={`/product/${product.slug}`}
        className="mt-[12px] line-clamp-3 min-h-[36px] text-[15px] leading-[18px] text-black transition-colors group-hover:text-[#d52027]"
      >
        {product.name}
      </Link>

      <div className="mt-auto pt-[6px]">
        {/* Titles all start on the same line and reserve 2 lines (so 1- and 2-line titles line up); stars + price are pinned to the card bottom. Stars row only renders when there are reviews. */}
        <FlashyStarRating rating={product.averageRating} count={product.reviewCount} className="mb-[8px] h-[22px]" />
        {product.type === "simple" ? (
          <div className="flex items-center justify-between gap-1">
            {/* Prices (one line) with SKU underneath, on the right (RTL start) */}
            <div className="shrink-0">
              <div className="flex flex-nowrap items-baseline gap-x-[6px] whitespace-nowrap">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-[24px] font-bold leading-[26px] text-[#d52027]"><Price value={product.salePrice} symbolSize={20} family="inherit" /></span>
                    <span className="relative text-[15px] font-normal leading-[17px] text-[#535353] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-[#535353]/70 after:content-[''] [unicode-bidi:isolate]"><Price value={product.regularPrice} symbolSize={13} family="inherit" /></span>
                  </>
                ) : (
                  <span className="text-[24px] font-bold leading-[26px] text-[#d52027]"><Price value={product.price} symbolSize={20} family="inherit" /></span>
                )}
              </div>
              {product.sku ? (
                <p className="mt-[4px] text-[12px] font-normal leading-[15px] text-[#0c0c0c]">מק&quot;ט: {product.sku}</p>
              ) : null}
            </div>
            {/* Qty + cart on the left (RTL end) */}
            <div className="flex min-w-0 items-center gap-1">
              <QuantityStepper quantity={quantity} onChange={setQuantity} size="mini" />
              <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size="sm" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-nowrap items-baseline gap-x-[8px] whitespace-nowrap">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-[24px] font-bold leading-[26px] text-[#d52027]"><Price value={product.salePrice} symbolSize={20} family="inherit" /></span>
                  <span className="relative text-[15px] font-normal leading-[17px] text-[#535353] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-[#535353]/70 after:content-[''] [unicode-bidi:isolate]"><Price value={product.regularPrice} symbolSize={13} family="inherit" /></span>
                </>
              ) : (
                <span className="text-[24px] font-bold leading-[26px] text-[#d52027]"><Price value={product.price} symbolSize={20} family="inherit" /></span>
              )}
            </div>
            {product.sku ? (
              <p className="mt-[4px] text-[16px] font-semibold leading-[20px] text-[#333]">מק&quot;ט: {product.sku}</p>
            ) : null}
            <Link prefetch={false}
              href={`/product/${product.slug}`}
              className="mt-[8px] block w-full rounded-full border border-black/10 px-6 py-3 text-center text-sm font-semibold text-black/80 transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              לצפייה במוצר
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
