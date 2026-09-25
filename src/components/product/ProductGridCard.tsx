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

/**
 * The richer product card (image + name + price + quantity stepper + add to
 * cart) used by the homepage sliders — shared here so a category/shop grid
 * can render the same "product box" instead of the plainer ProductCard.
 * `widthClassName` lets a horizontally-scrolling carousel size the card
 * itself; a plain CSS grid just leaves it at the default `w-full`.
 */
export function ProductGridCard({
  product,
  cardRef,
  widthClassName = "w-full",
}: {
  product: Product;
  cardRef?: (el: HTMLDivElement | null) => void;
  widthClassName?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const image = product.images[0];
  const hoverImage = product.images[1];

  const inWishlist = useWishlistStore((s) => s.has(product.databaseId));
  // Wishlist ids are synced once by the Header (root layout) — no per-card fetch.
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  return (
    <div
      ref={cardRef}
      className={`group flex shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg ${widthClassName}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-brand-soft/30"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {hoverImage ? (
          <Image
            src={hoverImage.src}
            alt={hoverImage.alt || product.name}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="scale-110 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        ) : null}
        {product.onSale ? (
          <span className="absolute top-3 end-3 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-semibold text-white">
            מבצע
          </span>
        ) : null}
        {product.brandLogoUrl ? (
          <span className="absolute top-3 start-3 flex h-9 max-w-[4.5rem] items-center justify-center overflow-hidden rounded-md bg-white/90 p-1 shadow-sm backdrop-blur-sm">
            <Image
              src={product.brandLogoUrl}
              alt={product.brand ?? ""}
              width={72}
              height={36}
              className="h-full w-auto object-contain"
            />
          </span>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.databaseId);
          }}
          aria-label={inWishlist ? "הסרה מרשימת המשאלות" : "הוספה לרשימת המשאלות"}
          aria-pressed={inWishlist}
          className={`absolute start-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white ${
            product.brandLogoUrl ? "top-14" : "top-3"
          } ${inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-brand-accent text-brand-accent" : "text-black/60"}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 text-right">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.8em] text-sm font-medium text-black/80 group-hover:text-brand-accent"
        >
          {product.name}
        </Link>

        {product.type === "simple" ? (
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-1 gap-y-2 pt-2">
            <div className="flex flex-col items-start gap-0.5 text-right">
              <span className="w-full text-xs text-black/60">{product.sku ? `מק"ט: ${product.sku}` : " "}</span>
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-lg font-bold text-brand-accent">{formatPrice(product.salePrice)}</span>
                    <span className="text-sm text-black/40 line-through">{formatPrice(product.regularPrice)}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-brand-accent">{formatPrice(product.price)}</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <QuantityStepper quantity={quantity} onChange={setQuantity} size="xs" />
              <AddToCartButton
                productId={product.databaseId}
                inStock={product.inStock}
                quantity={quantity}
                size="xs"
              />
            </div>
          </div>
        ) : (
          <>
            <span className="text-xs text-black/60">{product.sku ? `מק"ט: ${product.sku}` : " "}</span>
            <Link
              href={`/product/${product.slug}`}
              className="mt-auto block w-full rounded-full border border-black/10 px-6 py-3 text-center text-sm font-semibold text-black/80 transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              לצפייה במוצר
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
