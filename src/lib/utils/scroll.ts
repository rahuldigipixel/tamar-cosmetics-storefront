/**
 * Scrolls `item` to align with the inline-start edge of `container`.
 * Deliberately not `item.scrollIntoView()` — that also walks up to the
 * document and scrolls the page vertically whenever the carousel is
 * off-screen (e.g. a background autoplay timer firing while the user has
 * scrolled past it), which is exactly the bug this replaced.
 *
 * The inline-start edge is physically the *right* edge under `dir="rtl"`.
 * Aligning to the physical left edge instead (as this used to) hands
 * `scrollBy` a positive delta whenever the target item is already partly
 * visible — but Chrome's RTL scrollLeft range is `[-(scrollWidth -
 * clientWidth), 0]`, so a positive delta gets silently clamped to a no-op
 * (scrollLeft never leaves 0). Aligning to the matching physical edge for
 * the container's actual direction keeps the delta's sign consistent with
 * that range in both directions.
 */
export function scrollItemIntoRow(container: HTMLElement, item: HTMLElement) {
  const isRtl = getComputedStyle(container).direction === "rtl";
  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const delta = isRtl ? itemRect.right - containerRect.right : itemRect.left - containerRect.left;
  container.scrollBy({ left: delta, behavior: "smooth" });
}

const inFlight = new WeakMap<HTMLElement, number>();

/**
 * Eased horizontal scroll over a fixed duration — the browser's own
 * `behavior: "smooth"` finishes small moves in ~150ms, which reads as
 * instant. A new call cancels the one still running on the same container.
 */
export function animateScrollBy(container: HTMLElement, delta: number, durationMs: number) {
  const running = inFlight.get(container);
  if (running) cancelAnimationFrame(running);
  const start = container.scrollLeft;
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / durationMs);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    container.scrollLeft = start + delta * eased;
    if (t < 1) inFlight.set(container, requestAnimationFrame(tick));
    else inFlight.delete(container);
  };
  inFlight.set(container, requestAnimationFrame(tick));
}
