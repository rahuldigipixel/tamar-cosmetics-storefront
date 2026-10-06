"use client";

import { createContext, useContext } from "react";
import { DEFAULT_FREE_SHIPPING, type FreeShippingConfig } from "@/lib/utils/freeShipping";

const FreeShippingContext = createContext<FreeShippingConfig>(DEFAULT_FREE_SHIPPING);

/** Hands the wp-admin free-shipping config (already in the root layout's /global-data) to client components. */
export function FreeShippingProvider({ config, children }: { config: FreeShippingConfig; children: React.ReactNode }) {
  return <FreeShippingContext.Provider value={config}>{children}</FreeShippingContext.Provider>;
}

export const useFreeShipping = () => useContext(FreeShippingContext);

/** Renders a message, swapping "{amount}" for the highlighted remaining amount. */
export function renderShippingMessage(message: string, amount: string, amountClassName: string) {
  const [before, ...rest] = message.split("{amount}");
  if (rest.length === 0) return message;
  return (
    <>
      {before}
      <span className={amountClassName}>{amount}</span>
      {rest.join("{amount}")}
    </>
  );
}
