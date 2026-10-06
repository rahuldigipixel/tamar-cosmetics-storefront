// One top/bottom spacing for every wp-admin content page (return policy, shipping,
// cancellation, terms, FAQ, contact, suppliers and the legacy-copy pages).
// Top: 40px between the title band and the content. Bottom: the visible gap to
// the footer is 40px — the site footer already adds ~60px (desktop) / ~32px
// (mobile) of its own (measured), so the margin below tops it up / cancels the rest. Keep these
// literal so Tailwind sees them; change the numbers here to change every page.
export const PAGE_TOP = "pt-[40px]";
export const PAGE_BOTTOM = "mb-[8px] lg:-mb-[20px]";
