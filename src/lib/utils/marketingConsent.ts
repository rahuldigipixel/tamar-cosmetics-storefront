/** Flashy plugin's "accept marketing" checkbox settings (wp-admin → Flashy), delivered in /global-data. */
export interface MarketingConsentConfig {
  /** Show the checkbox on the checkout page. */
  checkout: boolean;
  /** Show the checkbox on the registration form. */
  signup: boolean;
  /** Message next to the box. */
  text: string;
  /** Start ticked (Flashy's "checkbox marked by default"). */
  checked: boolean;
}

// Hidden until the backend says otherwise — an older backend plugin (or Flashy switched off) shows no checkbox.
export const DEFAULT_MARKETING_CONSENT: MarketingConsentConfig = { checkout: false, signup: false, text: "", checked: false };

// Used only when the Flashy "Accept Marketing Text" field is empty.
export const DEFAULT_MARKETING_TEXT = "אני מסכימה לקבל דיוור פרסומי באמצעות מייל וסמס מחברת ע.צ.ת. תמר קוסמטיקס בע\"מ";

export function resolveMarketingConsent(raw: Partial<MarketingConsentConfig> | null | undefined): MarketingConsentConfig {
  return {
    checkout: Boolean(raw?.checkout),
    signup: Boolean(raw?.signup),
    text: raw?.text?.trim() || DEFAULT_MARKETING_TEXT,
    checked: Boolean(raw?.checked),
  };
}
