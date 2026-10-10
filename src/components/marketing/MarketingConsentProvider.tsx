"use client";

import { createContext, useContext } from "react";
import { DEFAULT_MARKETING_CONSENT, type MarketingConsentConfig } from "@/lib/utils/marketingConsent";

const MarketingConsentContext = createContext<MarketingConsentConfig>(DEFAULT_MARKETING_CONSENT);

export function MarketingConsentProvider({ config, children }: { config: MarketingConsentConfig; children: React.ReactNode }) {
  return <MarketingConsentContext.Provider value={config}>{children}</MarketingConsentContext.Provider>;
}

export const useMarketingConsent = () => useContext(MarketingConsentContext);
