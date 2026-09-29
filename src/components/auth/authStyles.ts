// Shared CTA style used across the login drawer and the /my-account,
// /my-account/lost-password pages — the site's standard gradient +
// hover-lift primary button style (see AddToCartButton.tsx / CartDrawer.tsx),
// per .claude/RULES.md's "new primary CTA buttons use the gradient style"
// rule.
export const AUTH_BUTTON_CLASS =
  "h-11 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] text-[16px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:pointer-events-none disabled:opacity-60";
