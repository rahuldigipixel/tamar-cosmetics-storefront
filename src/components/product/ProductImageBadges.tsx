import { ProductLabels } from "@/components/product/ProductLabels";
import { ShippingBadge } from "@/components/product/ShippingBadge";

/**
 * Top-left badge stack of a product-list card: the BeRocket "image" labels (all three plugin position groups) and the
 * free-shipping square flow in ONE column with a fixed gap, instead of each being absolutely positioned on its own
 * (their wp-admin margin offsets used to land them on top of each other — see `.tamar-image-labels` in globals.css).
 * Render inside the image wrapper (`relative`). The top-right corner stays with the discount % / brand logo.
 */
export function ProductImageBadges({
  html,
  price,
  className = "top-[6px] left-[6px] md:top-[10px] md:left-[10px]",
}: {
  html?: string;
  price: string | number | undefined;
  className?: string;
}) {
  return (
    <div dir="ltr" className={`tamar-image-labels pointer-events-none absolute z-[2] flex max-w-[60%] origin-top-left flex-col max-md:scale-[0.65] items-start gap-[5px] ${className}`}>
      <ProductLabels html={html} />
      <ShippingBadge price={price} className="!static" />
    </div>
  );
}
