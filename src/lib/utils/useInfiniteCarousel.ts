"use client";

import { useEffect, useRef, useState } from "react";
import { scrollItemIntoRow } from "./scroll";

const COPIES = 5; // odd count so there's a true middle copy to rest in
const RECENTER_DELAY_MS = 500; // must clear the smooth-scroll animation before jumping

/**
 * Drives a horizontally-scrolling carousel that loops in both directions
 * without ever snapping back to the first item. A plain `index % length`
 * wrap has to jump the scroll position back to 0 when it overflows, which
 * reads as a hard reset instead of a continuous slide.
 *
 * Trick: render `items` repeated `COPIES` times and track a `position`
 * into that repeated list rather than into `items` itself. Stepping just
 * moves `position` further along — always into real, already-rendered
 * content — and once the (smooth) scroll animation has had time to
 * finish, silently (instantly) re-centers `position` into the prior
 * matching slot in the middle copy. Because every copy holds identical
 * items, that re-center lands on a visually identical scroll offset, so
 * it's imperceptible — the slide just keeps going.
 */
export function useInfiniteCarousel<Item, El extends HTMLElement>({
  items,
  stepSize = 1,
  autoplayMs,
}: {
  items: Item[];
  stepSize?: number;
  autoplayMs?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(El | null)[]>([]);
  const count = items.length;
  const middleStart = count * Math.floor(COPIES / 2);

  const looped = count > 0 ? Array.from({ length: COPIES }, () => items).flat() : [];
  const [position, setPosition] = useState(middleStart);

  function scrollTo(target: number, smooth: boolean) {
    const container = trackRef.current;
    const item = itemRefs.current[target];
    if (!container || !item) return;
    if (smooth) {
      scrollItemIntoRow(container, item);
      return;
    }
    const isRtl = getComputedStyle(container).direction === "rtl";
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const delta = isRtl ? itemRect.right - containerRect.right : itemRect.left - containerRect.left;
    container.scrollBy({ left: delta });
  }

  function step(direction: 1 | -1) {
    if (count === 0) return;
    const next = position + direction * stepSize;
    setPosition(next);
    scrollTo(next, true);

    const middleEnd = middleStart + count - 1;
    if (next < middleStart || next > middleEnd) {
      window.setTimeout(() => {
        const recentered = middleStart + (((next - middleStart) % count) + count) % count;
        setPosition(recentered);
        scrollTo(recentered, false);
      }, RECENTER_DELAY_MS);
    }
  }

  useEffect(() => {
    scrollTo(position, false);
    // Only on mount — jumps the track to the middle copy before first paint settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoplayMs) return;
    const timer = setInterval(() => step(1), autoplayMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, autoplayMs]);

  return { trackRef, itemRefs, looped, step, middleStart };
}
