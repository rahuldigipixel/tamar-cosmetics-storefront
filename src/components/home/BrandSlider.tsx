"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types/product";

export function BrandSlider({ brands }: { brands: Brand[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: move 1px every 20ms — smooth continuous drift, no snapping
  useEffect(() => {
    const track = trackRef.current;
    if (!track || brands.length === 0) return;

    let rafId: number;
    let paused = false;

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    track.parentElement?.addEventListener("mouseenter", onEnter);
    track.parentElement?.addEventListener("mouseleave", onLeave);

    const tick = () => {
      if (!paused && track) {
        track.scrollLeft -= 1; // RTL: decrease scrollLeft to move right→left
        // Seamless loop: when we've scrolled past the first half, reset to same visual position in second half
        if (track.scrollLeft <= 0) {
          track.scrollLeft = track.scrollWidth / 2;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    // Start at the mid-point so the loop can run in both directions
    track.scrollLeft = track.scrollWidth / 2;
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      track.parentElement?.removeEventListener("mouseenter", onEnter);
      track.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, [brands.length]);

  if (brands.length === 0) return null;

  // Duplicate list for seamless infinite loop
  const doubled = [...brands, ...brands];

  return (
    <section className="mx-auto max-w-[1450px] py-6 sm:py-10">
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-12 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ direction: "ltr" }} // keep scroll math predictable regardless of page RTL
        >
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/brand/${brand.slug}/`}
              className="flex shrink-0 items-center justify-center opacity-100 grayscale-0 transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              style={{ width: 140, height: 64 }}
            >
              {brand.thumbnailUrl ? (
                <Image
                  src={brand.thumbnailUrl}
                  alt={brand.name}
                  width={140}
                  height={64}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-center text-lg font-bold text-black/50">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
