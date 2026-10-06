import { formatPrice } from "@/lib/utils/formatPrice";
import { renderShippingMessage, useFreeShipping } from "@/components/cart/FreeShippingProvider";
import type { Cart } from "@/types/cart";

/**
 * Free-shipping progress box shared by /cart and /checkout (legacy look: dashed box, striped red bar).
 * Legacy measures progress on the cart value before shipping, after discounts.
 */
export function FreeShippingBar({ cart, className = "" }: { cart: Cart; className?: string }) {
  const goodsValue = Math.max(0, (Number(cart.subtotal) || 0) - (Number(cart.discountTotal) || 0));
  const { threshold, msgRemaining, msgReachedCart } = useFreeShipping();
  const remaining = Math.max(0, threshold - goodsValue);
  const progress = Math.min(100, (goodsValue / threshold) * 100);

  return (
    <div
      className={`border-2 border-dashed border-black/[0.106] p-5 max-[481px]:px-[5px] max-[481px]:py-[15px] ${className}`}
    >
      <p className="text-center max-[768px]:text-[18px] max-[481px]:text-[19px]">
        {remaining > 0
          ? renderShippingMessage(msgRemaining, formatPrice(remaining), "font-semibold text-brand-accent")
          : msgReachedCart}
      </p>
      <div className="mt-[10px] h-[7px] bg-black/[0.06]" dir="rtl">
        <div
          className="h-full bg-brand-accent transition-[width] duration-500"
          style={{
            width: `${progress}%`,
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.2) 75%, transparent 75%, transparent)",
            backgroundSize: "15px 15px",
          }}
        />
      </div>
    </div>
  );
}
