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
export function CategoryProductCard({
  product,
  standalone = false,
  wideMobile = false,
  wishlist = false,
}: {
  product: Product;
  standalone?: boolean;
  /** Wishlist page: no card padding (text flush with the image edges), quick view only on hover. */
  wishlist?: boolean;
  /** One-card-per-row on mobile (SALE / related sliders): 24px price with the struck-through price on the same line. */
  wideMobile?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const priceCls = wideMobile
    ? "text-[24px] font-bold leading-[26px] text-[#d52027]"
    : "text-[18px] font-bold leading-[1.1] text-[#d52027] md:text-[24px] md:leading-[26px]";
  const regularCls = `relative ${
    wideMobile
      ? "text-[15px] font-light leading-[17px] text-[#535353]"
      : "text-[16px] font-normal leading-[1.1] text-[#444] md:text-[15px] md:font-light md:leading-[17px] md:text-[#535353]"
  } after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-[#535353]/50 after:content-[''] [unicode-bidi:isolate]`;
  const rowCls = (gap: string) =>
    // wideMobile: one row (sale price right, struck-through price beside it), bottom-aligned; otherwise stacked on mobile.
    wideMobile
      ? "flex flex-row flex-nowrap items-end gap-x-[12px] whitespace-nowrap"
      : `flex flex-col items-start gap-y-[2px] whitespace-nowrap md:flex-row md:flex-nowrap md:items-baseline ${gap}`;
  const image = product.images[0];
  const hoverImage = product.images[1];
  const discount = discountPercent(product);
  // Promoted coupon (wp-admin coupon flagged "show in product") — same strip as the product page, sized like the reference.
  // Full-width row under the price/cart row (simple products) or under the SKU (variable ones).
  // Right-side labels start below the top-right stack (discount badge, brand logo).
  const labelRightTop = (discount ? 24 : 0) + (product.brandLogoUrl ? 50 : 0) + (discount || product.brandLogoUrl ? 6 : 0);
  const couponBar = product.coupon ? (
    <p className="border border-brand-accent p-[2px] text-center text-[11px] leading-[1.4] font-normal whitespace-nowrap text-brand-accent md:border-2 md:p-[2px] md:text-[12px]">
      <span dir="rtl">השתמש בקוד</span> <strong className="font-bold">{product.coupon.code}</strong>
      {product.coupon.label ? (
        <>
          <span className="mx-[2px] text-black/40 md:mx-[5px]">|</span>
          <span dir="ltr">{product.coupon.label}</span>
        </>
      ) : null}
    </p>
  ) : null;

  return (
    <div data-tip-bounds className={`group relative isolate flex h-full flex-col bg-white ${wishlist ? "p-0" : "p-[10px]"} text-right ${wideMobile ? "max-md:pb-[15px] " : ""}${standalone ? "" : "border border-black/[.106] -mt-px -ml-px max-md:p-[5px]"}`}>
      {/* Wrapper (not the clipped Link) so a label's negative offset isn't cut off at the image edge. */}
      {/* Standalone (slider) cards run the image edge to edge: negative margins cancel the card padding (10px). */}
      <div className={standalone && !wishlist ? "relative -mx-[10px] -mt-[10px]" : "relative"} style={{ "--label-right-top": `${labelRightTop}px` } as React.CSSProperties}>
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
      <div className={`pointer-events-none absolute ${standalone ? "top-[6px] right-[6px]" : "top-[11px] right-[5px] md:top-[16px] md:right-[10px]"} flex flex-col gap-[5px] [&>*]:ml-auto`}>
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
            className="h-auto max-h-[45px] w-auto max-w-[69px] object-contain object-center opacity-90"
          />
        ) : null}
      </div>

      {/* Quick view + wishlist — shown on hover. */}
      <ProductHoverActions product={product} hideWishlist={wishlist} className={wishlist ? "top-0 left-0" : standalone ? "top-[11px] left-[6px]" : "top-[11px] left-[11px] md:top-[21px] md:left-[21px]"} />

      <Link prefetch={false}
        href={`/product/${product.slug}`}
        className="mt-[8px] md:mt-[12px] line-clamp-3 md:min-h-[36px] text-[15px] leading-[18px] text-black transition-colors group-hover:text-[#d52027]"
      >
        {product.name}
      </Link>

      <div className="pt-[15px] md:mt-auto md:pt-[12px]">
        {/* Titles all start on the same line and reserve 2 lines (so 1- and 2-line titles line up); stars + price are pinned to the card bottom. Stars row only renders when there are reviews. */}
        <div className="-mt-[5px] mb-[10px] empty:hidden md:mt-0 md:mb-0"><FlashyStarRating rating={product.averageRating} count={product.reviewCount} className="h-[20px] md:mb-[10px]" /></div>
        {product.type === "simple" ? (
          <>
            <div className="flex items-start justify-between gap-1 md:items-center">
              {/* Prices (one line) with SKU underneath, on the right (RTL start) */}
              <div className={`flex shrink-0 flex-col md:gap-[6px] ${wideMobile ? "gap-[6px]" : "gap-[2px]"}`}>
                <div className={rowCls("md:gap-x-[6px]")}>
                  {product.onSale && product.salePrice ? (
                    <>
                      <span className={priceCls}><Price value={product.salePrice} symbolSize="0.85em" family="inherit" /></span>
                      <span className={regularCls}><Price value={product.regularPrice} symbolSize="1em" family="inherit" /></span>
                    </>
                  ) : (
                    <span className={priceCls}><Price value={product.price} symbolSize="0.85em" family="inherit" /></span>
                  )}
                </div>
                {product.sku ? (
                  <p className="text-[12px] font-semibold leading-[14px] text-[#333]">מק&quot;ט: {product.sku}</p>
                ) : null}
              </div>
              {/* Qty + cart on the left (RTL end) */}
              <div className="flex min-w-0 items-center gap-[2px] md:gap-1">
                <QuantityStepper quantity={quantity} onChange={setQuantity} size={wideMobile ? "rowWide" : "row"} />
                <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size={wideMobile ? "rowWide" : "row"} />
              </div>
              </div>
            {couponBar ? <div className="mt-[8px]">{couponBar}</div> : null}
          </>
        ) : (
          <>
            <div className={rowCls("md:gap-x-[8px]")}>
              {product.onSale && product.salePrice ? (
                <>
                  <span className={priceCls}><Price value={product.salePrice} symbolSize="0.85em" family="inherit" /></span>
                  <span className={regularCls}><Price value={product.regularPrice} symbolSize="1em" family="inherit" /></span>
                </>
              ) : (
                <span className={priceCls}><Price value={product.price} symbolSize="0.85em" family="inherit" /></span>
              )}
            </div>
            {product.sku ? (
              <p className="mt-[4px] text-[12px] font-semibold leading-[14px] text-[#333]">מק&quot;ט: {product.sku}</p>
            ) : null}
            {couponBar ? <div className="mt-[8px]">{couponBar}</div> : null}
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
