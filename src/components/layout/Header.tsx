"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  Flame,
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { HeaderMenuItem, HeaderMenuLinkChild, HeaderMenuProductChild, SiteLogo } from "@/lib/wpgraphql/tamarApi";

const FALLBACK_LOGO_SRC = "/brand/logo.png";

function isSaleItem(item: HeaderMenuItem) {
  return item.label.trim().toUpperCase() === "SALE";
}

function trimTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function Header({ menu = [], logo = null }: { menu?: HeaderMenuItem[]; logo?: SiteLogo | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Desktop mega-menu: `openItemId` remembers the last-hovered/clicked
  // top-level item (it isn't cleared on close), while `menuVisible` alone
  // drives the open/closed CSS transition. Keeping the id around lets the
  // panel play its exit fade with the outgoing item's content still
  // rendered, instead of blanking the instant it closes.
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuLeft, setMenuLeft] = useState(0);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const categoryNavRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const panelItem = menu.find((item) => item.id === openItemId) ?? null;
  const panelLinkChildren: HeaderMenuLinkChild[] =
    panelItem?.children.filter((c): c is HeaderMenuLinkChild => c.type === "link") ?? [];
  const panelFeaturedProduct: HeaderMenuProductChild | null =
    panelItem?.children.find((c): c is HeaderMenuProductChild => c.type === "product") ?? null;

  // usePathname can hand back the raw (percent-encoded) segment for
  // non-ASCII slugs instead of the decoded text depending on how the route
  // was entered, while our menu urls from WordPress are always plain
  // decoded text — comparing the two directly silently never matches, so
  // every active-state check below decodes first.
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    // malformed sequence — fall back to the raw pathname
  }

  function isActiveHref(href: string) {
    return trimTrailingSlash(decodedPathname) === trimTrailingSlash(href);
  }

  // Hover-intent open/close: entering either the trigger button or the
  // panel cancels any pending close, so moving the mouse from one to the
  // other (they aren't DOM-adjacent, so plain CSS :hover can't bridge them)
  // doesn't flicker the menu shut. Leaving either schedules a short-delayed
  // close instead of closing instantly, so hover isn't overly twitchy.
  function openMenu(item: HeaderMenuItem, e: React.MouseEvent<HTMLButtonElement>) {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const btnRect = e.currentTarget.getBoundingClientRect();
    const navRect = categoryNavRef.current?.getBoundingClientRect();
    if (navRect) {
      const panelWidth = Math.min(navRect.width * 0.96, 920);
      const buttonCenter = btnRect.left - navRect.left + btnRect.width / 2;
      setMenuLeft(Math.max(0, Math.min(buttonCenter - panelWidth / 2, navRect.width - panelWidth)));
    }
    setOpenItemId(item.id);
    setMenuVisible(true);
  }

  function scheduleCloseMenu() {
    closeTimerRef.current = window.setTimeout(() => setMenuVisible(false), 200);
  }

  function cancelCloseMenu() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (!menuVisible) return;
    function onClickOutside(e: MouseEvent) {
      if (categoryNavRef.current && !categoryNavRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuVisible]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuVisible(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]">
      {/* Utility bar */}
      <div className="bg-brand-accent text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 sm:text-[13px]">
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="font-medium underline-offset-2 hover:underline">
              מעקב הזמנה
            </Link>
            <a href="tel:054-5405470" className="hidden items-center gap-1.5 font-medium sm:flex" dir="ltr">
              <Phone className="h-3.5 w-3.5" />
              054-5405470 &middot; 08:00-17:00
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="h-3.5 w-3.5" />
              משלוח חינם בקנייה מעל 349 ₪
            </span>
            <span className="hidden items-center gap-1.5 font-medium sm:flex">
              <Zap className="h-3.5 w-3.5" />
              אספקה 1-4 ימי עסקים
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-1 sm:px-6 lg:py-1">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="group">
            <Image
              src={logo?.url ?? FALLBACK_LOGO_SRC}
              alt={logo?.alt || "תמר קוסמטיקס"}
              width={logo?.width ?? 120}
              height={logo?.height ?? 66}
              priority
              className="h-auto w-[76px] transition-transform duration-300 group-hover:scale-105 sm:w-[92px]"
            />
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 lg:block">
          <div className="relative mx-auto flex h-11 max-w-xl items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש מוצר, מותג או מק&quot;ט..."
              className="h-full w-full rounded-full border border-black/10 bg-black/[0.03] pe-4 ps-12 text-[15px] shadow-inner outline-none transition-all focus:border-brand-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(213,32,39,0.08)]"
            />
            <button
              type="submit"
              aria-label="חיפוש"
              className="absolute start-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] text-white transition-transform hover:scale-105"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="חיפוש"
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 shadow-sm transition-all duration-200 lg:hidden ${
              searchOpen ? "border-brand-accent bg-brand-soft text-brand-accent" : "bg-white text-black/70 hover:border-brand-accent hover:text-brand-accent"
            }`}
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {pathname === "/cart" || pathname === "/checkout" ? (
            <Link
              href="/cart"
              aria-label="עגלת קניות"
              className="relative flex items-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-2.5 pe-4 ps-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cart.itemCount > 0 ? (
                <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-accent shadow ring-2 ring-white">
                  {cart.itemCount}
                </span>
              ) : null}
              <span className="hidden sm:inline">{formatPrice(cart.total)}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={openCartDrawer}
              aria-label="עגלת קניות"
              className="relative flex items-center gap-2 rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-2.5 pe-4 ps-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cart.itemCount > 0 ? (
                <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-accent shadow ring-2 ring-white">
                  {cart.itemCount}
                </span>
              ) : null}
              <span className="hidden sm:inline">{formatPrice(cart.total)}</span>
            </button>
          )}

          <Link
            href="/wishlist"
            aria-label="רשימת המשאלות"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-sm transition-all duration-200 hover:border-brand-accent hover:text-brand-accent"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlistCount > 0 ? (
              <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-semibold text-white ring-2 ring-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <Link
            href="/account/login"
            aria-label="חשבון שלי"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-sm transition-all duration-200 hover:border-brand-accent hover:text-brand-accent sm:flex"
          >
            <User className="h-4.5 w-4.5" />
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="תפריט"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-sm md:hidden"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Category nav — driven entirely by the admin-managed tree from
          GET /wp-json/tamar/v1/menu (see includes/class-header-menu.php on
          the WP side). Each item with children renders as a mega-menu
          trigger; an item with no children is a plain link. */}
      <nav ref={categoryNavRef} className="relative hidden border-t border-black/5 md:block">
        <div
          onScroll={() => setMenuVisible(false)}
          className="mx-auto flex max-w-[1400px] items-center gap-7 overflow-x-auto overflow-y-hidden px-4 py-2.5 sm:px-6"
        >
          {menu.map((item) => {
            const sale = isSaleItem(item);

            if (item.children.length === 0) {
              const active = isActiveHref(item.url);
              if (sale) {
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[18px] font-bold text-brand-accent transition-all hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:text-white hover:shadow-md"
                  >
                    <Flame className="h-3.5 w-3.5" fill="currentColor" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`shrink-0 text-[16px] font-medium transition-colors ${
                    active ? "text-brand-accent" : "text-black/70 hover:text-brand-accent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            const isOpen = menuVisible && openItemId === item.id;
            const active = isOpen || decodedPathname.startsWith(trimTrailingSlash(item.url));
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => (isOpen ? setMenuVisible(false) : openMenu(item, e))}
                onMouseEnter={(e) => openMenu(item, e)}
                onMouseLeave={scheduleCloseMenu}
                className={`flex shrink-0 items-center gap-1 text-[16px] font-medium transition-colors ${
                  active ? "text-brand-accent" : "text-black/70 hover:text-brand-accent"
                }`}
              >
                {item.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Rendered outside the scrolling row above so its overflow-x-auto
            (which per the CSS spec forces overflow-y to compute as "auto"
            too) can't clip or scroll-hide this panel. Positioned with a
            physical `left` (not the logical insetInlineStart) because
            menuLeft comes from getBoundingClientRect, which is already a
            physical-pixel measurement — assigning that to a logical
            property would anchor it to the opposite edge in this RTL layout. */}
        {panelItem ? (
          <div
            ref={menuPanelRef}
            onMouseEnter={cancelCloseMenu}
            onMouseLeave={scheduleCloseMenu}
            style={{ left: menuLeft }}
            className={`absolute top-full z-50 mt-3 w-[min(96vw,920px)] overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-2xl transition-all duration-200 ${
              menuVisible ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between gap-3 bg-gradient-to-l from-brand-soft/70 via-brand-soft/30 to-white px-6 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-black/80">{panelItem.label}</p>
              </div>
              <Link
                href={panelItem.url}
                onClick={() => setMenuVisible(false)}
                className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-accent"
              >
                לכל המוצרים
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </div>

            {panelItem.featuredTitle ? (
              <p className="pt-4 text-center text-base font-bold text-black/80">{panelItem.featuredTitle}</p>
            ) : null}

            <div className="flex max-h-[65vh] gap-5 overflow-y-auto p-5">
              <div className="grid flex-1 auto-rows-min grid-cols-2 content-start gap-2.5 sm:grid-cols-3">
                {panelLinkChildren.map((child) => {
                  const childActive = isActiveHref(child.url);
                  return (
                    <Link
                      key={child.id}
                      href={child.url}
                      onClick={() => setMenuVisible(false)}
                      className={`group flex items-start gap-2 rounded-2xl border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(213,32,39,0.35)] ${
                        childActive
                          ? "border-brand-accent/40 bg-brand-soft/60"
                          : "border-black/5 hover:border-brand-accent/30 hover:bg-brand-soft/40"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                          childActive ? "bg-brand-accent" : "bg-brand-accent/40 group-hover:bg-brand-accent"
                        }`}
                      />
                      <span
                        className={`text-sm leading-snug transition-colors group-hover:text-brand-accent ${
                          childActive ? "font-bold text-brand-accent" : "font-medium text-black/75"
                        }`}
                      >
                        {child.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {panelFeaturedProduct ? (
                <div className="flex w-44 shrink-0 flex-col items-center gap-3 rounded-2xl border border-black/5 bg-brand-soft/30 p-4 text-center sm:w-52">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
                    {panelFeaturedProduct.image ? (
                      <Image
                        src={panelFeaturedProduct.image.url}
                        alt={panelFeaturedProduct.image.alt}
                        fill
                        sizes="208px"
                        className="object-contain p-2"
                      />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-black/80">{panelFeaturedProduct.label}</p>
                  <span className="text-sm font-bold text-brand-accent">{formatPrice(panelFeaturedProduct.price)}</span>
                  <Link
                    href={panelFeaturedProduct.url}
                    onClick={() => setMenuVisible(false)}
                    className="mt-1 w-full rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    לצפייה במוצר
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>

      {/* Mobile search panel */}
      <div
        className={`grid overflow-hidden border-black/5 bg-white transition-[grid-template-rows,border-color] duration-300 lg:hidden ${
          searchOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr] border-t-0"
        }`}
      >
        <div className="min-h-0">
          <form onSubmit={handleSearch} className="px-4 py-4 sm:px-6">
            <div className="relative mx-auto max-w-2xl">
              <input
                autoFocus={searchOpen}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש מוצר, מותג או מק&quot;ט..."
                className="w-full rounded-full border border-black/10 bg-black/[0.02] py-3 pe-4 ps-12 text-sm outline-none transition-colors focus:border-brand-accent focus:bg-white"
              />
              <button
                type="submit"
                aria-label="חיפוש"
                className="absolute inset-y-0 start-4 flex items-center text-black/40 hover:text-brand-accent"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu drawer */}
      <aside
        className={`fixed inset-y-0 end-0 z-50 flex w-[82%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <Image
            src={logo?.url ?? FALLBACK_LOGO_SRC}
            alt={logo?.alt || "תמר קוסמטיקס"}
            width={logo?.width ?? 90}
            height={logo?.height ?? 50}
            className="h-auto w-16"
          />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="סגור תפריט"
            className="rounded-full p-2 text-black/60 hover:bg-black/5 hover:text-brand-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col overflow-y-auto px-5 py-2">
          {menu.map((item) => {
            const sale = isSaleItem(item);

            if (item.children.length === 0) {
              const active = isActiveHref(item.url);
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 border-b border-black/5 py-4 text-[22px] font-semibold last:border-none ${
                    active ? "text-brand-accent" : "text-black/85 hover:text-brand-accent"
                  }`}
                >
                  {sale ? <Flame className="h-5 w-5" fill="currentColor" /> : null}
                  {item.label}
                </Link>
              );
            }

            const linkChildren = item.children.filter((c): c is HeaderMenuLinkChild => c.type === "link");
            const featured = item.children.find((c): c is HeaderMenuProductChild => c.type === "product") ?? null;
            const isMobileOpen = mobileOpenId === item.id;

            return (
              <div key={item.id} className="border-b border-black/5">
                <button
                  type="button"
                  onClick={() => setMobileOpenId((id) => (id === item.id ? null : item.id))}
                  className="flex w-full items-center justify-between py-4 text-[22px] font-semibold text-black/85"
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
                </button>
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ${
                    isMobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="flex min-h-0 flex-col gap-1 rounded-xl bg-brand-soft/20 p-2 pb-2">
                    {item.featuredTitle ? (
                      <p className="pt-1 pb-1 text-center text-base font-bold text-black/80">{item.featuredTitle}</p>
                    ) : null}
                    {featured ? (
                      <Link
                        href={featured.url}
                        onClick={() => setMobileOpen(false)}
                        className="mb-1 flex items-center gap-3 rounded-lg bg-white p-2.5 shadow-sm"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-soft/40">
                          {featured.image ? (
                            <Image
                              src={featured.image.url}
                              alt={featured.image.alt}
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-black/80">{featured.label}</p>
                          <span className="text-sm font-bold text-brand-accent">{formatPrice(featured.price)}</span>
                        </div>
                        <ChevronLeft className="h-4 w-4 shrink-0 text-brand-accent" />
                      </Link>
                    ) : null}
                    {linkChildren.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center justify-between gap-1.5 rounded-lg px-3 py-2.5 text-base text-black/70 transition-colors hover:bg-white hover:text-brand-accent"
                      >
                        <span className="truncate">{child.label}</span>
                        <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-black/30 transition-colors group-hover:text-brand-accent" />
                      </Link>
                    ))}
                    <Link
                      href={item.url}
                      onClick={() => setMobileOpen(false)}
                      className="mt-1 rounded-lg px-3 py-2.5 text-center text-base font-semibold text-brand-accent hover:bg-white"
                    >
                      לכל המוצרים
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/account/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 py-4 text-base font-medium text-black/85 hover:text-brand-accent"
          >
            <User className="h-4 w-4" />
            החשבון שלי
          </Link>
        </nav>

        <div className="mt-auto border-t border-black/5 px-5 py-4 text-xs text-black/40">
          משלוח חינם בקנייה מעל 349 ₪
        </div>
      </aside>
    </header>
  );
}
