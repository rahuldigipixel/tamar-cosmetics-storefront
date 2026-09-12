"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export function ProductGallery({
  images,
  name,
  productId,
}: {
  images: ProductImage[];
  name: string;
  productId: number;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const current = images[active];

  const inWishlist = useWishlistStore((s) => s.has(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function step(direction: 1 | -1) {
    if (images.length === 0) return;
    setActive((i) => (i + direction + images.length) % images.length);
  }

  return (
    <div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-soft/30"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setZoomOrigin(`${x}% ${y}%`);
          setZoomed(true);
        }}
        onMouseLeave={() => setZoomed(false)}
      >
        {current ? (
          <Image
            src={current.src}
            alt={current.alt || name}
            fill
            sizes="50vw"
            priority
            style={{ transformOrigin: zoomOrigin }}
            className={`object-cover transition-transform duration-300 ${zoomed ? "scale-[1.8]" : "scale-100"}`}
          />
        ) : null}

        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          onMouseEnter={() => setZoomed(false)}
          onMouseMove={(e) => e.stopPropagation()}
          aria-label={inWishlist ? "הסרה מרשימת המשאלות" : "הוספה לרשימת המשאלות"}
          aria-pressed={inWishlist}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-brand-accent text-brand-accent" : "text-black/60"}`} />
        </button>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              onMouseEnter={() => setZoomed(false)}
              onMouseMove={(e) => e.stopPropagation()}
              aria-label="התמונה הקודמת"
              className="absolute inset-y-0 start-2 z-10 flex items-center justify-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              onMouseEnter={() => setZoomed(false)}
              onMouseMove={(e) => e.stopPropagation()}
              aria-label="התמונה הבאה"
              className="absolute inset-y-0 end-2 z-10 flex items-center justify-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
              </span>
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={`${image.id}-${i}`}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border ${
                i === active ? "border-brand-accent" : "border-black/10"
              }`}
            >
              <Image src={image.src} alt={image.alt || name} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
