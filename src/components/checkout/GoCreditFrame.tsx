"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;
const FAILED_STATUSES = ["cancelled", "failed", "trash"];

/**
 * GoCredit card form embedded in /checkout (same flow as the Tamar Course checkout).
 * `iframeUrl` comes from POST /api/checkout/payment; the WP plugin sends the frame to the storefront's
 * /checkout/success (paid) or /checkout?payment_failed=1 (cancelled) when GoCredit finishes.
 */
export function GoCreditFrame({ iframeUrl, orderId, orderKey }: { iframeUrl: string; orderId: number; orderKey: string }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [iframeUrl]);

  // When GoCredit is done it sends the browser to our return URL. Inside the frame that would render the whole
  // storefront in a small box, so move the top window there instead.
  function handleLoad() {
    setLoaded(true);
    try {
      const innerHref = iframeRef.current?.contentWindow?.location?.href;
      if (!innerHref || innerHref === "about:blank") return;
      const inner = new URL(innerHref);
      if (inner.origin !== window.location.origin) return;
      leavingRef.current = true;
      window.location.replace(innerHref);
    } catch {
      // Cross-origin: the shopper is still on GoCredit — expected.
    }
  }

  // Safety net: if the gateway finishes without navigating the frame, the order status still moves us on.
  useEffect(() => {
    let stopped = false;
    const startedAt = Date.now();

    async function poll() {
      if (stopped || leavingRef.current) return;
      try {
        const res = await fetch(`/api/checkout/payment-status?order=${orderId}&key=${encodeURIComponent(orderKey)}`, { cache: "no-store" });
        if (!res.ok || stopped || leavingRef.current) return;
        const data = (await res.json()) as { paid: boolean; status: string };
        if (data.paid) {
          leavingRef.current = true;
          router.replace(`/checkout/success?order=${orderId}&key=${encodeURIComponent(orderKey)}`);
        } else if (FAILED_STATUSES.includes(data.status)) {
          leavingRef.current = true;
          window.location.replace(`/checkout?payment_failed=1&order=${orderId}`);
        }
      } catch {
        // transient — next tick retries
      }
    }

    const timer = setInterval(() => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        return;
      }
      void poll();
    }, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [orderId, orderKey, router]);

  return (
    <div ref={containerRef} className="relative mx-auto mt-[30px] w-full max-w-[1600px] overflow-hidden bg-white p-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      {!loaded ? (
        <div role="status" aria-label="טוען" className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <span className="h-[40px] w-[40px] animate-spin rounded-full border-[4px] border-black/15 border-t-brand-accent" />
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        title="תשלום מאובטח"
        onLoad={handleLoad}
        allow="payment *"
        className="block h-[min(950px,calc(100vh-12rem))] min-h-[560px] w-full border-0"
      />
    </div>
  );
}
