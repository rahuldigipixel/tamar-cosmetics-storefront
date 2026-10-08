/** Free-shipping badge config — managed in wp-admin → הגדרות עמוד מוצר → section 5 (delivered in /global-data). */
export interface ShippingBadgeConfig {
  enabled: boolean;
  /** Products priced at or above this (₪) get the badge. */
  threshold: number;
  message: string;
}

// Same values as the wp-admin defaults (and the legacy hard-coded behaviour), used while the backend plugin is older.
export const DEFAULT_SHIPPING_BADGE: ShippingBadgeConfig = { enabled: true, threshold: 349, message: "משלוח חינם" };

export function resolveShippingBadge(raw: Partial<ShippingBadgeConfig> | null | undefined): ShippingBadgeConfig {
  const threshold = Number(raw?.threshold);
  return {
    enabled: raw?.enabled ?? DEFAULT_SHIPPING_BADGE.enabled,
    threshold: threshold > 0 ? threshold : DEFAULT_SHIPPING_BADGE.threshold,
    message: raw?.message?.trim() || DEFAULT_SHIPPING_BADGE.message,
  };
}
