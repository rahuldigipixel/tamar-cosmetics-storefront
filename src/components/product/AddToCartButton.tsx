"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

const SIZES = {
  xs: { width: "w-fit", padding: "px-2.5 py-1.5", text: "text-sm", icon: "h-3 w-3", gap: "gap-1", showIcon: false, iconOnly: false },
  sm: { width: "w-fit", padding: "p-2.5", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: true },
  // Compact icon-only variant (linked-products slider on the product page).
  // Linked-products slider stripe: same 36px height as the quantity box and the price block, so they read as one row.
  stripe: { width: "w-9", padding: "h-9", text: "text-sm", icon: "h-4 w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  // Product-card slider row: 40px, same height as the quantity box and the price block.
  row: { width: "w-9 md:w-10", padding: "h-9 md:h-10", text: "text-sm", icon: "h-4 w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  // Same row on one-card-per-slide mobile cards (SALE / related): bigger touch target, desktop identical to "row".
  rowWide: { width: "w-11 md:w-10", padding: "h-11 md:h-10", text: "text-sm", icon: "h-5 w-5 md:h-4 md:w-4", gap: "gap-1", showIcon: true, iconOnly: true },
  mini: { width: "w-fit", padding: "p-2", text: "text-sm", icon: "h-3.5 w-3.5", gap: "gap-1", showIcon: true, iconOnly: true },
  // Linked-products slider: full-width text button under the quantity box.
  slider: { width: "w-full", padding: "px-2 h-8 whitespace-nowrap", text: "text-[14px] leading-none", icon: "h-4 w-4", gap: "gap-1.5", showIcon: false, iconOnly: false },
  md: { width: "w-full", padding: "px-6 py-3", text: "text-sm", icon: "h-4 w-4", gap: "gap-2", showIcon: true, iconOnly: false },
  // Single product page: legacy-site sizing (arbitrary px on purpose — approved exception to the 18px floor).
  lg: { width: "w-full", padding: "px-2 sm:px-4 h-[40px] whitespace-nowrap", text: "text-[18px] md:text-[16px] min-[1280px]:text-[18px] leading-[22px] font-light sm:font-semibold", icon: "h-4 w-4", gap: "gap-2", showIcon: false, iconOnly: false },
} as const;

const PRIMARY_STYLE =
  "bg-gradient-to-l from-brand-accent to-[#ff6b72] text-white shadow-sm hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]";
// Light-pink secondary CTA (reference "הוספה לסל" next to the red "קנה עכשיו").
const SOFT_STYLE =
  "bg-[#f3c3cc] text-[#333] hover:bg-[#eeb0bb] hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.35)]";

// Tooltip rendered in a portal with fixed positioning so carousel overflow can't clip it;
// clamped to the viewport so it never runs off either edge.
function IconTip({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    // Keep the tooltip inside its product card (falls back to the viewport).
    const box = ref.current?.closest("[data-tip-bounds]")?.getBoundingClientRect();
    const half = 45;
    const min = Math.max(box?.left ?? 0, 0) + half + 4;
    const max = Math.min(box?.right ?? window.innerWidth, window.innerWidth) - half - 4;
    const x = Math.min(Math.max(r.left + r.width / 2, min), Math.max(min, max));
    setPos({ x, y: r.top - 6 });
  }

  return (
    <div
      ref={ref}
      className="relative inline-flex shrink-0"
      onMouseEnter={show}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos
        ? createPortal(
            <span
              role="tooltip"
              style={{ left: pos.x, top: pos.y }}
              className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/85 px-2 py-0.5 text-[14px] leading-[18px] text-white shadow-md"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </div>
  );
}

// ── Phone-order-only products ────────────────────────────────────────────────────────────────────────────────────────
// Managed in wp-admin → WooCommerce → Settings → Extended Settings → Disable Add to Cart Settings (delivered in
// /global-data as `phoneOrder`). Listed products get no quantity / add-to-cart / buy-now: lists swap them for
// `MoreInfoButton`, the product page and quick view show `PhoneOrderBox` instead.

export interface PhoneOrderConfig {
  enabled: boolean;
  /** Database ids of the products that can only be ordered by phone. */
  productIds: number[];
  /** Plain text — line breaks are kept. */
  message: string;
}

// Same text as the wp-admin default (and the legacy box), used while the backend plugin is older.
const DEFAULT_PHONE_ORDER_MESSAGE = "הזמנה טלפונית בלבד\nלהזמנות: 054-5405470";

interface PhoneOrderState {
  ids: ReadonlySet<number>;
  message: string;
}

// Off until the backend says otherwise: with no list there is nothing to swap.
const PhoneOrderContext = createContext<PhoneOrderState>({ ids: new Set(), message: DEFAULT_PHONE_ORDER_MESSAGE });

/**
 * Makes the wp-admin "phone order only" list available to every product card, the product page and quick view. Takes the
 * raw `/global-data` value (the root layout is a server component and can't call helpers from this client file).
 */
export function PhoneOrderProvider({ config, children }: { config?: Partial<PhoneOrderConfig> | null; children: React.ReactNode }) {
  const value = useMemo<PhoneOrderState>(() => {
    const ids = config?.enabled === true && Array.isArray(config.productIds) ? config.productIds.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
    return { ids: new Set(ids), message: config?.message?.trim() || DEFAULT_PHONE_ORDER_MESSAGE };
  }, [config]);
  return <PhoneOrderContext.Provider value={value}>{children}</PhoneOrderContext.Provider>;
}

/** Whether this product can only be ordered by phone (no cart buttons), plus the admin message to show instead. */
export function usePhoneOrder(productId: number): { phoneOnly: boolean; message: string } {
  const { ids, message } = useContext(PhoneOrderContext);
  return { phoneOnly: ids.has(productId), message };
}

/**
 * The red "הזמנה טלפונית בלבד / להזמנות: …" box shown instead of the purchase buttons. Copied from the legacy
 * `.wc_contact_us_btn p` (#d52027 background, 5px radius, 5px padding, white 16px/20.8px text, right-aligned, 50% of
 * its column = 250px at 1920 — capped there) — the 16px is the legacy size, an approved exception to the 18px floor
 * (see AGENTS.md). The product page hides it on phones like the legacy page (pass `hidden md:block`). The message is
 * plain text from wp-admin; `whitespace-pre-line` turns its line breaks into the box's lines.
 */
export function PhoneOrderBox({ message, className = "" }: { message: string; className?: string }) {
  return (
    <p
      className={`w-full rounded-[5px] bg-[#d52027] p-[5px] text-right text-[16px] leading-[20.8px] whitespace-pre-line text-white md:w-1/2 md:max-w-[250px] md:min-w-[170px] ${className}`}
    >
      {message}
    </p>
  );
}

/**
 * Phone-order-only products (wp-admin → Disable Add to Cart Settings) can't go in the cart: in a list the quantity box and
 * "add to cart" give way to this link to the product page, which shows the phone message — same as the legacy cards,
 * which keep the cart-icon button but make it "מידע נוסף" (read more). Same sizes/tooltip as `AddToCartButton`.
 */
export function MoreInfoButton({ href, size = "md" }: { href: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  const link = (
    <Link
      prefetch={false}
      href={href}
      aria-label={s.iconOnly ? "מידע נוסף" : undefined}
      className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full ${PRIMARY_STYLE} ${s.padding} ${s.text} ${size === "lg" ? "" : "font-semibold"} transition-all duration-200 hover:-translate-y-0.5`}
    >
      {s.iconOnly ? <ShoppingBag className={s.icon} /> : "מידע נוסף"}
    </Link>
  );

  return s.iconOnly ? <IconTip label="מידע נוסף">{link}</IconTip> : link;
}

export function AddToCartButton({
  productId,
  inStock,
  variationId,
  quantity = 1,
  size = "md",
  variant = "primary",
}: {
  productId: number;
  inStock: boolean;
  variationId?: number;
  quantity?: number;
  size?: keyof typeof SIZES;
  variant?: "primary" | "soft";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [submitting, setSubmitting] = useState(false);
  const s = SIZES[size];

  if (!inStock) {
    if (s.iconOnly) {
      return (
        <IconTip label="אזל מהמלאי">
          <button
            disabled
            aria-label="אזל מהמלאי"
            className={`flex ${s.width} shrink-0 items-center justify-center rounded-full bg-black/10 ${s.padding} text-black/40`}
          >
            <ShoppingBag className={s.icon} />
          </button>
        </IconTip>
      );
    }
    return (
      <button
        disabled
        className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full bg-black/10 ${s.padding} ${s.text} font-semibold text-black/40`}
      >
        אזל מהמלאי
      </button>
    );
  }

  async function handleClick() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addItem(productId, quantity, variationId);
    } finally {
      setSubmitting(false);
    }
  }

  const button = (
    <button
      onClick={handleClick}
      disabled={submitting}
      aria-label={s.iconOnly ? "הוספה לסל" : undefined}
      className={`flex ${s.width} shrink-0 items-center justify-center ${s.gap} rounded-full ${variant === "soft" ? SOFT_STYLE : PRIMARY_STYLE} ${s.padding} ${s.text} ${size === "lg" ? "" : "font-semibold"} transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0`}
    >
      {submitting ? (
        <Loader2 className={`${s.icon} animate-spin`} />
      ) : s.iconOnly ? (
        <ShoppingBag className={s.icon} />
      ) : (
        <>
          {s.showIcon ? <ShoppingBag className={s.icon} /> : null}
          הוספה לסל
        </>
      )}
    </button>
  );

  if (!s.iconOnly) return button;

  return (
    <IconTip label="הוספה לסל">{button}</IconTip>
  );
}
