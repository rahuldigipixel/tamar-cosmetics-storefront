// Star row used by every product box and the single-product title. Rating and
// review count come from GraphQL `averageRating` / `reviewCount`, which the
// backend plugin fills from the Flashy review data — so it renders on the
// server with the page instead of waiting for thunder.js to inject it.
// Renders nothing when a product has no reviews.
const LEGACY_FONT = 'system-ui, ui-sans-serif, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

export function FlashyStarRating({
  rating,
  count,
  className = "mt-[10px] min-h-[24px]",
  legacy = false,
}: {
  rating?: number;
  count?: number;
  className?: string;
  /** Single product page: count matches the legacy site (system-ui 16px/24px 400 #0c0c0c). */
  legacy?: boolean;
}) {
  const filled = Math.round(rating ?? 0);

  // No reviews → no row at all (no reserved height), so cards without stars
  // don't show an empty gap; prices stay bottom-aligned by the card's mt-auto.
  if ((count ?? 0) <= 0) return null;

  return (
    <div className={className}>
      <div className={`flex items-center ${legacy ? "" : "gap-[2px]"}`} aria-label={`דירוג ${filled} מתוך 5`} style={legacy ? { fontFamily: LEGACY_FONT } : undefined}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`text-[16px] text-[#d52027] ${legacy ? "leading-[24px]" : "leading-[22px]"}`}>
            {n <= filled ? "★" : "☆"}
          </span>
        ))}
        {legacy ? (
          <span
            className="ms-[4px] text-[16px] leading-[24px] font-normal not-italic text-[#0c0c0c]"
            style={{ fontFamily: LEGACY_FONT }}
          >
            ({count})
          </span>
        ) : (
          <span className="ms-[2px] text-[13px] text-[#666]">({count})</span>
        )}
      </div>
    </div>
  );
}
