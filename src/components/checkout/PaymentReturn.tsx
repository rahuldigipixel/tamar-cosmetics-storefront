"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";

/**
 * Rendered by /checkout/success. If GoCredit redirected inside the payment iframe, this page is loading in the
 * frame — hop the top window here so the shopper sees it full-page. Otherwise the order is paid: empty the cart.
 */
export function PaymentReturn() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    if (window.top && window.top !== window.self) {
      window.top.location.replace(window.location.href);
      return;
    }
    clearCart();
  }, [clearCart]);
  return null;
}
