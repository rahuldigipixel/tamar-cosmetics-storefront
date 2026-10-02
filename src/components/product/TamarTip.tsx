/**
 * "הטיפ של תמר" callout above the icon boxes — text comes from the product's
 * `tip_description` field. Pink rounded card like the legacy site: bold red
 * title on the right (RTL start), decorative quote marks on the left.
 */
export function TamarTip({ text }: { text: string }) {
  return (
    <aside className="relative overflow-hidden rounded-[20px] bg-[#f2c4cc] px-[18px] py-[12px] text-right">
      {/* Legacy site's `.tamar-product-tip::before`: a 80px serif “ at left 8px / top 0, accent red at 48% opacity. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-[8px] text-[80px] leading-none text-[#d520287a]"
        style={{ fontFamily: "serif" }}
      >
        &ldquo;
      </span>
      <p className="text-[18px] leading-[26px] font-bold text-brand-accent">הטיפ של תמר</p>
      <p className="mt-[2px] text-[15px] leading-[18px] whitespace-pre-line text-black">{text}</p>
    </aside>
  );
}
