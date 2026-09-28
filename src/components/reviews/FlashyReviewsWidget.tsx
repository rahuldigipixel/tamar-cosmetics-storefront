import { FLASHY_REVIEWS_ELEMENT_ID } from "@/lib/flashy";

// Renders into the container thunder.js (loaded once in the root layout) scans
// for and fills with review content fetched from Flashy's cloud. Omit itemId to
// show the site-wide reviews feed instead of a single product's reviews.
export function FlashyReviewsWidget({ itemId }: { itemId?: number }) {
  return <div data-inject-flashy-element={FLASHY_REVIEWS_ELEMENT_ID} data-item-id={itemId} />;
}
