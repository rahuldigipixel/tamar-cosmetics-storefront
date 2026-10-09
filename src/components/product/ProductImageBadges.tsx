import { ProductLabels } from "@/components/product/ProductLabels";
import { ShippingBadge } from "@/components/product/ShippingBadge";

/**
 * Badge grid of a product-list card: the BeRocket "image" labels keep the wp-admin side (left or right only — center, line and margin are ignored),
 * so labels never overlap; the free-shipping square sits above the left group, and the right group starts
 * below the discount % / brand logo (`--label-right-top`). See `.tamar-image-labels` in globals.css.
 * Render inside the image wrapper (`relative`). Fades out while the card is hovered (the quick-view / wishlist icons take its place).
 */
export function ProductImageBadges({
  html,
  price,
  className = "top-[6px] left-[6px] w-[calc((100%-12px)/0.65)] md:top-[10px] md:left-[10px] md:w-[calc(100%-20px)]",
}: {
  html?: string;
  price: string | number | undefined;
  className?: string;
}) {
  return (
    <div dir="ltr" className={`tamar-image-labels pointer-events-none absolute z-[2] grid grid-cols-2 items-start origin-top-left max-md:scale-[0.65] transition-opacity duration-200 [@media(hover:hover)]:group-hover:opacity-0 ${className}`}>
      <ProductLabels html={html} />
      <div className="col-start-1 row-start-1 mb-[5px]">
        <ShippingBadge price={price} className="!static" />
      </div>
    </div>
  );
}
