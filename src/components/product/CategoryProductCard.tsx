"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { formatPrice } from "@/lib/utils/formatPrice";

function discountPercent(product: Product): number | null {
  if (!product.onSale || !product.salePrice) return null;
  const regular = Number(product.regularPrice);
  const sale = Number(product.salePrice);
  if (!regular || !sale || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

// Deterministic fake review so the same product always shows the same stars
// across renders. ~60% of products get stars, rest show none.
function fakeReview(id: number): { rating: number; count: number } | null {
  const h = ((id * 2654435761) >>> 0);
  if (h % 10 < 4) return null;
  return { rating: 3 + (h % 3), count: 5 + (h % 96) };
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
  const label = product.labels[0];
  const review =
    (product.reviewCount ?? 0) > 0
      ? { rating: Math.round(product.averageRating ?? 0), count: product.reviewCount! }
      : fakeReview(product.databaseId);

  const inWishlist = useWishlistStore((s) => s.has(product.databaseId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  return (
    <div className={`group relative flex h-full flex-col border border-black/[.106] bg-white p-[15px] text-right${standalone ? "" : " -mt-px -ml-px"}`}>
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden">
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
            className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}
      </Link>

      {/* Top-right: discount badge, brand logo under it. */}
      <div className="pointer-events-none absolute top-[21px] right-[15px] flex flex-col items-end gap-[5px]">
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
            className="h-[36px] w-auto max-w-[120px] object-contain"
          />
        ) : null}
      </div>

      {/* Promo label (admin product labels) on the image's left. */}
      {label ? (
        <span
          className="pointer-events-none absolute top-[101px] left-[22px] max-w-[70px] rounded-[3px] px-[6px] py-[5px] text-center text-[14px] font-semibold leading-[16.8px] text-white"
          style={{ backgroundColor: label.background || "#ff3300", color: label.color || "#fff" }}
        >
          {label.text}
        </span>
      ) : null}

      {/* Wishlist — shown on hover, like the reference's quick buttons. */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.databaseId)}
        aria-label={inWishlist ? "הסרה מרשימת המשאלות" : "הוספה לרשימת המשאלות"}
        aria-pressed={inWishlist}
        className={`absolute top-[26px] left-[6px] flex h-[45px] w-[50px] items-center justify-center bg-white transition-opacity ${
          inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <Heart className={`h-[18px] w-[18px] ${inWishlist ? "fill-[#d52027] text-[#d52027]" : "text-[#333]"}`} />
      </button>

      <Link
        href={`/product/${product.slug}`}
        className="mt-[4px] line-clamp-3 text-[15px] leading-[18px] text-black transition-colors group-hover:text-[#d52027]"
      >
        {product.name}
      </Link>

      <div className="mt-auto pt-[6px]">
        {/* Always reserve the stars row height so all cards align regardless of whether a product has reviews */}
        <div className="mb-[8px] flex h-[22px] items-center gap-[2px]" aria-label={review ? `דירוג ${review.rating} מתוך 5` : undefined}>
          {review ? (
            <>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="text-[16px] leading-[22px] text-[#d52027]">
                  {n <= review.rating ? "★" : "☆"}
                </span>
              ))}
              <span className="ms-[2px] text-[13px] text-[#666]">({review.count})</span>
            </>
          ) : null}
        </div>
        {product.type === "simple" ? (
          <div className="flex items-center justify-between gap-1">
            {/* Price + SKU on the right (RTL start) */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-[6px]">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-[22px] font-bold leading-[24px] text-[#d52027]">{formatPrice(product.salePrice)}</span>
                    <span className="text-[13px] font-light text-[#535353] line-through">{formatPrice(product.regularPrice)}</span>
                  </>
                ) : (
                  <span className="text-[22px] font-bold leading-[24px] text-[#d52027]">{formatPrice(product.price)}</span>
                )}
              </div>
              {product.sku ? (
                <p className="mt-[4px] text-[12px] font-semibold leading-[12px] text-[#333]">מק"ט: {product.sku}</p>
              ) : null}
            </div>
            {/* Qty + cart on the left (RTL end) */}
            <div className="flex shrink-0 items-center gap-1">
              <QuantityStepper quantity={quantity} onChange={setQuantity} size="sm" />
              <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} size="sm" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-[6px]">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-[22px] font-bold leading-[24px] text-[#d52027]">{formatPrice(product.salePrice)}</span>
                  <span className="text-[13px] font-light text-[#535353] line-through">{formatPrice(product.regularPrice)}</span>
                </>
              ) : (
                <span className="text-[22px] font-bold leading-[24px] text-[#d52027]">{formatPrice(product.price)}</span>
              )}
            </div>
            {product.sku ? (
              <p className="mt-[4px] text-[12px] font-semibold leading-[12px] text-[#333]">מק"ט: {product.sku}</p>
            ) : null}
            <Link
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
