"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Heart, X } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export function ProductGallery({
  images,
  name,
  productId,
  brandName,
  brandLogoUrl,
}: {
  images: ProductImage[];
  name: string;
  productId: number;
  brandName?: string;
  brandLogoUrl?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = images[active];

  const inWishlist = useWishlistStore((s) => s.has(productId));
  // Wishlist ids are synced once by the Header (root layout).
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  function step(direction: 1 | -1) {
    if (images.length === 0) return;
    setActive((i) => (i + direction + images.length) % images.length);
  }

  // Lightbox owns the keyboard/scroll while open — matches the reference
  // production-site behavior (Esc closes, arrow keys page through images,
  // body doesn't scroll behind the overlay).
  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

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

        <div className="group/expand absolute bottom-3 start-3 z-20">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={() => setZoomed(false)}
            onMouseMove={(e) => e.stopPropagation()}
            aria-label="הגדלת התמונה"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
          >
            <Expand className="h-4 w-4 text-black/60" />
          </button>
          <span className="pointer-events-none absolute bottom-full start-0 mb-2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover/expand:opacity-100">
            הגדלת תמונה
          </span>
        </div>

        {brandLogoUrl ? (
          <span className="absolute top-3 left-3 z-10 flex h-11 max-w-[5.5rem] items-center justify-center overflow-hidden rounded-md bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
            <Image
              src={brandLogoUrl}
              alt={brandName ?? ""}
              width={88}
              height={44}
              className="h-full w-auto object-contain"
            />
          </span>
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

      {lightboxOpen && current ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              aria-label="סגירה"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 ? (
              <span dir="ltr" className="text-base font-medium">
                {active + 1} / {images.length}
              </span>
            ) : null}
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            <div
              className="relative h-full w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt || name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="התמונה הקודמת"
                  className="absolute inset-y-0 start-2 z-10 flex items-center justify-center"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                    <ChevronRight className="h-6 w-6" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="התמונה הבאה"
                  className="absolute inset-y-0 end-2 z-10 flex items-center justify-center"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                    <ChevronLeft className="h-6 w-6" />
                  </span>
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div
              className="flex justify-center gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, i) => (
                <button
                  key={`lightbox-${image.id}-${i}`}
                  onClick={() => setActive(i)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border-2 ${
                    i === active ? "border-brand-accent" : "border-transparent"
                  }`}
                >
                  <Image src={image.src} alt={image.alt || name} fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
