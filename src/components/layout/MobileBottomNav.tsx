"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, Store, User } from "lucide-react";
import { useAuthDrawerStore } from "@/lib/store/useAuthDrawerStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

/*
 * Fixed bottom tab bar on mobile + tablet (< lg, the same breakpoint where the
 * header switches to its mobile layout): shop / wishlist / cart / my account.
 * Matches the legacy site's bar. Label size (11px / weight 600 / line-height 1, measured on the legacy site) is copied from the legacy
 * site — below the 18px floor, flagged in AGENTS.md as an approved exception
 * only if the user confirms it. Order below is the RTL reading order (first = right).
 */
const ITEM =
  "relative flex flex-1 flex-col items-center justify-center gap-[3px] px-1 text-[11px] font-semibold leading-none text-[#333] transition-colors hover:text-brand-accent";

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.cart.itemCount);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const customer = useAuthStore((s) => s.customer);
  const openAuthDrawer = useAuthDrawerStore((s) => s.openDrawer);

  // Persisted stores hydrate from localStorage before React hydrates; gate the counts/auth state so the
  // first client render matches the server HTML (same pattern as Header.tsx).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const badge = (count: number) =>
    mounted && count > 0 ? (
      <span className="absolute -top-[6px] -right-[9px] h-[16px] min-w-[16px] rounded-full bg-[#d52027] px-[3px] text-center text-[10px] font-normal leading-[16px] text-white">
        {count}
      </span>
    ) : null;

  const active = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? "text-brand-accent" : "");
  const onCartPage = /^\/(cart|checkout)\/?$/.test(pathname);

  const cartInner = (
    <>
      <span className="relative">
        <ShoppingCart className="h-[24px] w-[24px] stroke-[1.5]" />
        {badge(cartCount)}
      </span>
      עגלה
    </>
  );

  return (
    <>
      {/* Spacer so the fixed bar never covers the footer's last line. */}
      <div aria-hidden="true" className="h-[64px] lg:hidden" />
      <nav
        aria-label="ניווט מהיר"
        className="fixed inset-x-0 bottom-0 z-[70] flex h-[64px] border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden"
        style={{ boxSizing: "content-box" }}
      >
        <Link href="/shop" prefetch={false} className={`${ITEM} ${active("/shop")}`}>
          <Store className="h-[24px] w-[24px] stroke-[1.5]" />
          חנות
        </Link>

        <Link href="/רשימת-משאלות" prefetch={false} className={`${ITEM} ${active("/wishlist")}`}>
          <span className="relative">
            <Heart className="h-[24px] w-[24px] stroke-[1.5]" />
            {badge(wishlistCount)}
          </span>
          רשימת המועדפים
        </Link>

        {onCartPage ? (
          <Link href="/cart" prefetch={false} className={`${ITEM} ${active("/cart")}`}>
            {cartInner}
          </Link>
        ) : (
          <button type="button" onClick={openCartDrawer} className={ITEM}>
            {cartInner}
          </button>
        )}

        {mounted && customer ? (
          <Link href="/my-account" prefetch={false} className={`${ITEM} ${active("/my-account")}`}>
            <User className="h-[24px] w-[24px] stroke-[1.5]" />
            החשבון שלי
          </Link>
        ) : (
          <button type="button" onClick={openAuthDrawer} className={ITEM}>
            <User className="h-[24px] w-[24px] stroke-[1.5]" />
            החשבון שלי
          </button>
        )}
      </nav>
    </>
  );
}
