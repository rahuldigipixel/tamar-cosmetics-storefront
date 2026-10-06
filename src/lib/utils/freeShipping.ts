/** Free-shipping progress bar config — managed in wp-admin → הגדרות תמר → הגדרות כלליות (delivered in /global-data). */
export interface FreeShippingConfig {
  /** Cart value (₪, before shipping) from which delivery is free. */
  threshold: number;
  /** Shown while below the threshold; "{amount}" is replaced by the remaining amount. */
  msgRemaining: string;
  msgReachedCart: string;
  msgReachedDrawer: string;
}

// Used when the backend plugin is older / the field is missing — same values as the wp-admin defaults.
export const DEFAULT_FREE_SHIPPING: FreeShippingConfig = {
  threshold: 349,
  msgRemaining: "נותר לך עוד {amount} למשלוח חינם !",
  msgReachedCart: "מזל טוב! המשלוח עליך חינם !",
  msgReachedDrawer: "יפה ! מגיע לך משלוח חינם",
};

export function resolveFreeShipping(raw: Partial<FreeShippingConfig> | null | undefined): FreeShippingConfig {
  const threshold = Number(raw?.threshold);
  return {
    threshold: threshold > 0 ? threshold : DEFAULT_FREE_SHIPPING.threshold,
    msgRemaining: raw?.msgRemaining || DEFAULT_FREE_SHIPPING.msgRemaining,
    msgReachedCart: raw?.msgReachedCart || DEFAULT_FREE_SHIPPING.msgReachedCart,
    msgReachedDrawer: raw?.msgReachedDrawer || DEFAULT_FREE_SHIPPING.msgReachedDrawer,
  };
}
