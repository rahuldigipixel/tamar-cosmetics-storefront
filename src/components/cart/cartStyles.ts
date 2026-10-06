/**
 * Site-theme primary button (gradient + hover lift + glow) — same treatment as `AddToCartButton`'s
 * primary variant. The cart page clones the legacy layout 1:1 but keeps the new site's button look.
 * Callers add their own size (height / padding / font) classes.
 */
export const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:from-brand-accent disabled:hover:to-[#ff6b72] disabled:hover:shadow-sm";
