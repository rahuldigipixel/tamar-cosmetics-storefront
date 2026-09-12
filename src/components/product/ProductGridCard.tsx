"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

function formatPrice(value: string) {
  const numeric = Number(value);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(
    Number.isNaN(numeric) ? 0 : numeric
  );
}

function QuantityStepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  return (
    <div className="flex h-11 w-fit shrink-0 items-center self-center rounded-full border border-black/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="הפחת כמות"
        className="flex h-full w-9 items-center justify-center text-black/60 transition-colors hover:text-brand-accent"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        aria-label="הוסף כמות"
        className="flex h-full w-9 items-center justify-center text-black/60 transition-colors hover:text-brand-accent"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

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

  const inWishlist = useWishlistStore((s) => s.has(product.databaseId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group flex shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg ${widthClassName}`}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full bg-brand-soft/30">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {product.onSale ? (
          <span className="absolute top-3 end-3 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-semibold text-white">
            מבצע
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
          className={`absolute top-3 start-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white ${
            inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
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

        <span className="text-xs text-black/60">{product.sku ? `מק"ט: ${product.sku}` : " "}</span>

        <div className="mt-1 flex items-baseline gap-2">
          {product.onSale && product.salePrice ? (
            <>
              <span className="text-lg font-bold text-brand-accent">{formatPrice(product.salePrice)}</span>
              <span className="text-sm text-black/40 line-through">{formatPrice(product.regularPrice)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-brand-accent">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          {product.type === "simple" ? (
            <>
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
              <div className="min-w-0 flex-1">
                <AddToCartButton productId={product.databaseId} inStock={product.inStock} quantity={quantity} />
              </div>
            </>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="block w-full rounded-full border border-black/10 px-6 py-3 text-center text-sm font-semibold text-black/80 transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              לצפייה במוצר
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
