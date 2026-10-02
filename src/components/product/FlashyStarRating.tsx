// Star row used by every product box and the single-product title. Rating and
// review count come from GraphQL `averageRating` / `reviewCount`, which the
// backend plugin fills from the Flashy review data — so it renders on the
// server with the page instead of waiting for thunder.js to inject it.
// Renders nothing when a product has no reviews.
export function FlashyStarRating({
  rating,
  count,
  className = "mt-[10px] min-h-[24px]",
}: {
  rating?: number;
  count?: number;
  className?: string;
}) {
  const filled = Math.round(rating ?? 0);

  // No reviews → no row at all (no reserved height), so cards without stars
  // don't show an empty gap; prices stay bottom-aligned by the card's mt-auto.
  if ((count ?? 0) <= 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-[2px]" aria-label={`דירוג ${filled} מתוך 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="text-[16px] leading-[22px] text-[#d52027]">
            {n <= filled ? "★" : "☆"}
          </span>
        ))}
        <span className="ms-[2px] text-[13px] text-[#666]">({count})</span>
      </div>
    </div>
  );
}
