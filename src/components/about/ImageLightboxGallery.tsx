"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AboutImage } from "@/lib/wpgraphql/tamarApi";

const isLegacyHost = (url: string) => url.includes("tamarcosmetics.co.il");

/**
 * Certificates gallery (legacy: Elementor gallery + lightbox): 4 columns of 9:16
 * tiles on desktop (21px gap) / 1 column on mobile (10px gap). Clicking a tile opens
 * a full-screen lightbox with arrows, an "n / N" counter, close button, Esc and
 * arrow-key support.
 */
export function ImageLightboxGallery({ images }: { images: AboutImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // RTL page: the right arrow goes to the previous image, the left one to the next.
      if (e.key === "ArrowRight") move(-1);
      if (e.key === "ArrowLeft") move(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, move]);

  if (count === 0) return null;
  const current = open === null ? null : images[open];

  return (
    <>
      <div className="grid grid-cols-1 gap-[10px] lg:grid-cols-4 lg:gap-[21px]">
        {images.map((image, i) => (
          <button
            key={`${image.url}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={image.alt || `תמונה ${i + 1}`}
            className="relative block aspect-[9/16] w-full cursor-zoom-in overflow-hidden"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 100vw"
              unoptimized={isLegacyHost(image.url)}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" role="dialog" aria-modal="true" onClick={close}>
          <button type="button" onClick={close} aria-label="סגירה" className="absolute left-5 top-5 z-10 text-white/90 hover:text-white">
            <X className="h-7 w-7" />
          </button>
          <span className="absolute right-5 top-5 z-10 text-[16px] text-white/90" dir="ltr">
            {(open ?? 0) + 1} / {count}
          </span>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                aria-label="הקודם"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-2 text-white/90 hover:text-white lg:right-8"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                aria-label="הבא"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 p-2 text-white/90 hover:text-white lg:left-8"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            </>
          ) : null}

          <div className="relative h-[82vh] w-[88vw] max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <Image src={current.full} alt={current.alt} fill sizes="90vw" unoptimized className="object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
