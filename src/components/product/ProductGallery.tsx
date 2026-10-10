"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, Pause, Play, X } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { ProductLabels } from "@/components/product/ProductLabels";
import { ShippingBadge } from "@/components/product/ShippingBadge";

/** iframe src for a YouTube / Vimeo page url (autoplay), or null when the id can't be found. */
function embedUrl(type: "youtube" | "vimeo", url: string): string | null {
  if (type === "youtube") {
    const id = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
  }
  const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
}

// The wishlist heart lives in the details column (reference layout); the
// brand logo is overlaid top-left here at the legacy label size (max 100×110,
// natural aspect, opacity .9), and shown smaller above the title there.
export function ProductGallery({
  images,
  name,
  brandName,
  brandLogoUrl,
  labelsHtml,
  discount,
  price,
}: {
  /** Current price, for the free-shipping badge. */
  price?: string;
  images: ProductImage[];
  name: string;
  brandName?: string;
  brandLogoUrl?: string;
  /** Rendered Advanced Product Labels for the image (Product.labelsHtml.image). */
  labelsHtml?: string;
  /** Sale discount percentage, shown as a red badge in the top-left corner above the brand logo. */
  discount?: number | null;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Index of the image whose video is playing; pausing/finishing or switching image drops back to the image.
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const current = images[active];
  const video = current?.video;
  const playing = Boolean(video) && playingIndex === active;

  function step(direction: 1 | -1) {
    if (images.length === 0) return;
    setPlayingIndex(null);
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
      {/* Outer wrapper holds the labels so the image box's overflow-hidden (zoom) doesn't clip their negative offset. */}
      <div className="relative isolate">
      <div
        className="group/gallery relative aspect-square w-full overflow-hidden rounded-lg bg-brand-soft/30"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          if (video) return;
          setZoomOrigin(`${x}% ${y}%`);
          setZoomed(true);
        }}
        onMouseLeave={() => setZoomed(false)}
      >
        {playing && video ? (
          video.type === "mp4" ? (
            <video
              key={video.url}
              src={video.url}
              poster={current.src}
              autoPlay
              playsInline
              onClick={() => setPlayingIndex(null)}
              onPause={() => setPlayingIndex(null)}
              onEnded={() => setPlayingIndex(null)}
              className={`absolute inset-0 z-10 h-full w-full bg-white ${video.size === "cover" ? "object-cover" : "object-contain"}`}
            />
          ) : (
            <iframe
              src={embedUrl(video.type, video.url) ?? undefined}
              title={name}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 z-10 h-full w-full border-0 bg-black"
            />
          )
        ) : current ? (
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

        {playing && video?.type === "mp4" ? (
          <button
            type="button"
            onClick={() => setPlayingIndex(null)}
            aria-label="עצירת וידאו"
            className="absolute top-1/2 left-1/2 z-20 flex h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity hover:bg-white [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/gallery:opacity-100"
          >
            <Pause className="h-8 w-8 fill-black/70 text-black/70" />
          </button>
        ) : null}

        {video && !playing && (video.type === "mp4" || embedUrl(video.type, video.url)) ? (
          <button
            type="button"
            onClick={() => setPlayingIndex(active)}
            onMouseEnter={() => setZoomed(false)}
            aria-label="הפעלת וידאו"
            className="absolute top-1/2 left-1/2 z-20 flex h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform hover:scale-110 hover:bg-white"
          >
            <Play className="h-8 w-8 fill-black/70 text-black/70" />
          </button>
        ) : null}

        {discount ? (
          <span dir="ltr" className="pointer-events-none absolute top-[15px] left-[15px] z-20 bg-[#d52027] px-[8px] text-[12px] leading-[17px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}

        {brandLogoUrl ? (
          <Image
            src={brandLogoUrl}
            alt={brandName ?? ""}
            width={100}
            height={93}
            className={`pointer-events-none absolute hidden md:block ${discount ? "top-[42px]" : "top-3"} left-[15px] z-10 h-auto max-h-[110px] w-auto max-w-[100px] object-contain object-center opacity-90`}
          />
        ) : null}

        <div className="absolute bottom-3 start-3 z-20">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={() => setZoomed(false)}
            onMouseMove={(e) => e.stopPropagation()}
            aria-label="הגדלת התמונה"
            className="group/expand flex h-[52px] items-center justify-center rounded-full bg-white px-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all hover:bg-white"
          >
            <Expand className="h-5 w-5 shrink-0 text-[#333]" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[20px] leading-[28px] font-normal text-[#333] opacity-0 transition-all duration-300 group-hover/expand:ms-[12px] group-hover/expand:max-w-[160px] group-hover/expand:opacity-100 group-focus-visible/expand:ms-[12px] group-focus-visible/expand:max-w-[160px] group-focus-visible/expand:opacity-100">
              לחצו להגדלה
            </span>
          </button>
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              onMouseEnter={() => setZoomed(false)}
              onMouseMove={(e) => e.stopPropagation()}
              aria-label="התמונה הקודמת"
              className="absolute inset-y-0 start-2 z-10 flex items-center justify-center transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/gallery:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-none bg-white/90 shadow-sm transition-colors hover:bg-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              onMouseEnter={() => setZoomed(false)}
              onMouseMove={(e) => e.stopPropagation()}
              aria-label="התמונה הבאה"
              className="absolute inset-y-0 end-2 z-10 flex items-center justify-center transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/gallery:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-none bg-white/90 shadow-sm transition-colors hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
              </span>
            </button>
          </>
        ) : null}
      </div>
      <ProductLabels html={labelsHtml} />
      <ShippingBadge price={price} className="top-[72px] left-0 z-20" />
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => (
            <button
              key={`${image.id}-${i}`}
              onClick={() => {
                setPlayingIndex(null);
                setActive(i);
              }}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border ${
                i === active ? "border-brand-accent" : "border-black/10"
              }`}
            >
              <Image src={image.src} alt={image.alt || name} fill sizes="64px" className="object-cover" />
              {image.video ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-5 w-5 fill-white text-white" />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen && current ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black"
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
                  <span className="flex h-11 w-11 items-center justify-center rounded-none bg-white/10 text-white transition-colors hover:bg-white/20">
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
                  <span className="flex h-11 w-11 items-center justify-center rounded-none bg-white/10 text-white transition-colors hover:bg-white/20">
                    <ChevronLeft className="h-6 w-6" />
                  </span>
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div
              className="flex justify-center gap-2 overflow-x-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
