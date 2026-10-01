import type { SiteSettings } from "@/lib/wpgraphql/tamarApi";

// Fallbacks used only when a field is left empty in wp-admin → הגדרות תמר → הגדרות כלליות.
// Account/element IDs are public identifiers (same class as a GA/GTM ID), not secrets.
const DEFAULT_FLASHY_ACCOUNT_ID = 3294;
const DEFAULT_FLASHY_REVIEWS_ELEMENT_ID = "291";
// The Flashy review data was synced from the legacy WordPress site, so the product links
// its widget renders point there; FlashyReviewsWidget rewrites them to this site's origin.
const DEFAULT_FLASHY_LEGACY_SITE_ORIGIN = "https://www.tamarcosmetics.co.il";
const DEFAULT_WHATSAPP_NUMBER = "972545405470";

export interface Integrations {
  flashyAccountId: number;
  flashyReviewsElementId: string;
  flashyLegacySiteOrigin: string;
  whatsappNumber: string;
}

/**
 * Third-party IDs managed in wp-admin (הגדרות תמר → הגדרות כלליות), delivered inside the
 * shared /global-data call — so reading them costs no extra request. Empty / missing values
 * (field left blank, or an older backend plugin) fall back to the built-in defaults.
 */
export function resolveIntegrations(settings: SiteSettings | null | undefined): Integrations {
  const i = settings?.integrations;
  const accountId = Number(i?.flashyAccountId);
  return {
    flashyAccountId: Number.isInteger(accountId) && accountId > 0 ? accountId : DEFAULT_FLASHY_ACCOUNT_ID,
    flashyReviewsElementId: i?.flashyReviewsElementId || DEFAULT_FLASHY_REVIEWS_ELEMENT_ID,
    flashyLegacySiteOrigin: i?.flashyLegacySiteOrigin || DEFAULT_FLASHY_LEGACY_SITE_ORIGIN,
    whatsappNumber: i?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
  };
}
