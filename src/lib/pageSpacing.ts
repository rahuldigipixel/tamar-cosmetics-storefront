// One top/bottom spacing for every wp-admin content page (return policy, shipping,
// cancellation, terms, FAQ, contact, suppliers and the legacy-copy pages).
// Top: 40px between the title band and the content. Bottom: the gap to the footer
// is 50px site-wide on every page, set once by the footer's own `mt-[50px]` in
// components/layout/Footer.tsx — so no extra margin here. Keep these literal so
// Tailwind sees them; change the numbers here to change every page.
export const PAGE_TOP = "pt-[40px]";
export const PAGE_BOTTOM = "mb-0";
