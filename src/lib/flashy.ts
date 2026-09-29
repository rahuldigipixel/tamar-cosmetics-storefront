// Flashy (js.flashyapp.com) social-proof review widget — confirmed by inspecting
// the live WP site's rendered HTML. It's a client-side embed served entirely from
// Flashy's own cloud (thunder.js scans the DOM for [data-inject-flashy-element]),
// so it needs no backend plugin install and doesn't count against the WPGraphQL
// call budget. Account/element IDs are public tracking identifiers (same class as
// a GA/GTM ID), not secrets.
export const FLASHY_ACCOUNT_ID = 3294;
export const FLASHY_REVIEWS_ELEMENT_ID = "291";

// The review data behind this widget is synced from the legacy WordPress site's
// Flashy account, so every "view product" link it renders points there instead
// of this headless frontend. Rewritten client-side in FlashyReviewsWidget.
export const FLASHY_LEGACY_SITE_ORIGIN = "https://www.tamarcosmetics.co.il";
