"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  Clock,
  Flame,
  Gift,
  Menu,
  Shield,
  ShoppingCart,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import type {
  HeaderBar,
  HeaderBarLink,
  HeaderMenuItem,
  HeaderMenuLinkChild,
  HeaderMenuProductChild,
  SiteLogo,
} from "@/lib/wpgraphql/tamarApi";
import { WhatsAppIcon } from "./FloatingActions";
import { HeaderSearch } from "./HeaderSearch";

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

const FALLBACK_LOGO_SRC = "/brand/logo.png";

// Keys match Tamar_Header_Bar::ICON_CHOICES on the WP side (wp-admin →
// כותרת (Header) → פס עליון).
const SERVICE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // "percent" is the WP-side option key (label: "תג מחיר (%)") — rendered as
  // a price-tag glyph, matching the live reference site, not a bare % sign.
  percent: Tag,
  gift: Gift,
  truck: Truck,
  whatsapp: WhatsAppIcon,
  shield: Shield,
  clock: Clock,
};

// The reference site's own icon artwork for the standard keys; any other key
// falls back to the lucide glyph in SERVICE_ICON_MAP.
const SERVICE_ICON_IMAGES: Record<string, string> = {
  whatsapp: "/brand/icon-whatsapp.png",
  truck: "/brand/icon-truck.png",
  gift: "/brand/icon-gift.png",
  percent: "/brand/icon-percent.png",
};

function isSaleItem(item: HeaderMenuItem) {
  return item.label.trim().toUpperCase() === "SALE";
}

function trimTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

// Reference-site values (tamarcosmetics.co.il): #333 bold text with a
// brand-soft (#FDE7EB) highlight bar behind its lower edge — 7px under the
// right-hand group ("nav"), 5px under the left-hand group ("html").
const TOP_LINK_CLASS = {
  nav: "min-w-[47px] text-center text-[12px] leading-[1.2] after:top-[calc(100%-6px)] after:h-[7px]",
  html: "text-[12.5px] leading-[16px] after:bottom-0 after:h-[5px]",
} as const;

function TopBarLink({ link, variant = "html" }: { link: HeaderBarLink; variant?: keyof typeof TOP_LINK_CLASS }) {
  const className = `relative isolate inline-block whitespace-nowrap font-bold text-[#333] transition-colors after:absolute after:inset-x-0 after:-z-10 after:bg-[#fde7eb] after:content-[''] hover:text-brand-accent ${TOP_LINK_CLASS[variant]}`;
  if (isExternalUrl(link.url)) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.url} className={className}>
      {link.label}
    </Link>
  );
}

// Rotates through the admin-managed announcement messages (wp-admin →
// כותרת (Header) → פס עליון) — the `key={index}` remount replays the
// crossfade-in defined in globals.css on every rotation.
function AnnouncementSlider({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <p key={index} className="animate-top-bar-fade truncate text-center">
      {messages[index % messages.length]}
    </p>
  );
}

export function Header({
  menu = [],
  logo = null,
  stickyLogo = null,
  bar = null,
}: {
  menu?: HeaderMenuItem[];
  logo?: SiteLogo | null;
  /** Logo for the compact sticky header; falls back to `logo`. */
  stickyLogo?: SiteLogo | null;
  bar?: HeaderBar | null;
}) {
  const pathname = usePathname();

  // Reference (WoodMart "sticky real"): the full header scrolls away with the
  // page, and once it's fully out of view a compact copy is pinned to the top
  // — announcement bar and top links hidden, 55px logo row with the small
  // logo, 54px nav. The wrapper keeps the full header's height while compact
  // so switching modes never shifts the page content.
  const headerRef = useRef<HTMLElement>(null);
  const fullHeightRef = useRef(0);
  const [fullHeight, setFullHeight] = useState(0);
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);

  useEffect(() => {
    function measure() {
      if (headerRef.current && !compactRef.current) {
        fullHeightRef.current = headerRef.current.offsetHeight;
        setFullHeight(fullHeightRef.current);
      }
    }
    function onScroll() {
      const next = window.scrollY > fullHeightRef.current;
      compactRef.current = next;
      setCompact(next);
    }
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop mega-menu: `openItemId` remembers the last-hovered/clicked
  // top-level item (it isn't cleared on close), while `menuVisible` alone
  // drives the open/closed CSS transition. Keeping the id around lets the
  // panel play its exit fade with the outgoing item's content still
  // rendered, instead of blanking the instant it closes.
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [overlayTop, setOverlayTop] = useState(0);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const categoryNavRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const announcements = bar?.announcements ?? [];
  const linksRight = bar?.linksRight ?? [];
  const linksLeft = bar?.linksLeft ?? [];
  const serviceIcons = bar?.serviceIcons ?? [];

  const panelItem = menu.find((item) => item.id === openItemId) ?? null;
  const panelLinkChildren: HeaderMenuLinkChild[] =
    panelItem?.children.filter((c): c is HeaderMenuLinkChild => c.type === "link") ?? [];
  // The panel's side feature: the promoted category on "category" items
  // (wp-admin "קטגוריה מקודמת בתפריט"), else a product child on custom items.
  const panelProductChild: HeaderMenuProductChild | null =
    panelItem?.children.find((c): c is HeaderMenuProductChild => c.type === "product") ?? null;
  const panelFeature = panelItem?.featuredCategory
    ? { ...panelItem.featuredCategory, cta: "לצפייה בקטגוריה" }
    : panelProductChild
      ? { label: panelProductChild.label, url: panelProductChild.url, image: panelProductChild.image, cta: "לצפייה במוצר" }
      : null;

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
  function openMenu(item: HeaderMenuItem, e: React.SyntheticEvent<HTMLElement>) {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // Reference (Woodmart): the panel drops 10px below the hovered item's
    // own row (the nav wraps onto 2 rows), and the page under the header
    // is dimmed from the nav's bottom edge down.
    const btnRect = e.currentTarget.getBoundingClientRect();
    const navRect = categoryNavRef.current?.getBoundingClientRect();
    if (navRect) {
      setMenuTop(btnRect.bottom - navRect.top + 10);
      setOverlayTop(navRect.bottom);
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

  // Close every panel on navigation — reset during render (React's
  // "adjust state on prop change" pattern) rather than in an effect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setMenuVisible(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);


  // All sizes/colors below are the reference site's own CSS values
  // (tamarcosmetics.co.il, Woodmart header builder + custom CSS). The
  // sub-18px sizes are a deliberate, explicitly-requested exception to the
  // site's font floor (see AGENTS.md), scoped to this header only.
  const logoImage = (className: string, source: SiteLogo | null = logo) => (
    <Link href="/" className="shrink-0">
      <Image
        src={source?.url ?? FALLBACK_LOGO_SRC}
        alt={source?.alt || "תמר קוסמטיקס"}
        width={source?.width ?? 130}
        height={source?.height ?? 120}
        priority={source === logo}
        className={`h-auto ${className}`}
      />
    </Link>
  );

  // Woodmart "design-5"/"design-2" count badge: 15px red circle, 9px text,
  // top -5px / inline-end -9px (the tools row is direction:ltr, so right).
  const countBadge = (count: number) => (
    <span className="absolute -top-[5px] -right-[9px] z-[1] h-[15px] w-[15px] rounded-full bg-[#d52027] text-center text-[9px] font-normal leading-[15px] tracking-normal text-white">
      {count}
    </span>
  );

  const cartTrigger = (showTotal: boolean) => {
    const content = (
      <>
        <span className="relative">
          <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
          {countBadge(cart.itemCount)}
        </span>
        {showTotal ? <span className="ms-[15px]">{formatPrice(cart.total)}</span> : null}
      </>
    );
    const className =
      "flex h-[40px] items-center px-[10px] text-[14px] font-bold text-[#333] transition-colors hover:text-[rgba(51,51,51,.6)]";
    return pathname === "/cart" || pathname === "/checkout" ? (
      <Link href="/cart" dir="ltr" aria-label="עגלת קניות" className={className}>
        {content}
      </Link>
    ) : (
      <button type="button" dir="ltr" onClick={openCartDrawer} aria-label="עגלת קניות" className={className}>
        {content}
      </button>
    );
  };

  return (
    <div style={compact && fullHeight ? { height: fullHeight } : undefined}>
    <header
      ref={headerRef}
      className={`z-40 bg-white font-['Open_Sans_Hebrew',Arial,Helvetica,sans-serif] ${
        compact ? "animate-header-slide-down fixed inset-x-0 top-0 shadow-[0_1px_3px_rgba(0,0,0,.12)]" : "relative"
      }`}
    >
      {/* Announcement bar — admin-managed rotating messages (wp-admin →
          כותרת (Header) → פס עליון). Hidden in the compact sticky header. */}
      <div className={`bg-[#d52027] text-white ${compact ? "hidden" : ""}`}>
        <div className="mx-auto flex h-[30px] max-w-[1600px] items-center justify-center overflow-hidden px-[40px] text-[15px] font-normal leading-[20px]">
          <AnnouncementSlider messages={announcements} />
        </div>
      </div>

      {/* Desktop — logo centered across both rows. Right column: top links
          over service icons. Left column: top links over search + cart /
          account / wishlist. Grid column 1 is the right-hand side (RTL). */}
      <div className="hidden border-b border-[rgba(129,129,129,.2)] lg:block">
        <div
          className={`relative mx-auto grid max-w-[1600px] grid-cols-[1fr_126px_1fr] px-[15px] ${
            compact ? "h-[55px]" : "h-[133px]"
          }`}
        >
          {/* Positions measured against the live reference at 1920px: both
              link rows centered on the same line, search box 71–117px,
              service icons bottom-aligned with it, logo bottom at 127px. */}
          <div className={`flex flex-col ${compact ? "justify-center" : "justify-between pt-[16px] pb-[16px]"}`}>
            <div className={`h-[40px] items-center gap-[30px] ${compact ? "hidden" : "flex"}`}>
              {linksRight.map((link) => (
                <TopBarLink key={link.id} link={link} variant="nav" />
              ))}
            </div>

            {/* Service icons — admin-managed (wp-admin → כותרת (Header) →
                פס עליון). */}
            <div className={`flex h-[46px] justify-between pl-[1.5vw] ${compact ? "items-center" : "items-end"}`}>
              {serviceIcons.map((item) => {
                const iconImage = SERVICE_ICON_IMAGES[item.icon];
                const Icon = SERVICE_ICON_MAP[item.icon] ?? Tag;
                return (
                  <div key={item.id} className="flex items-center gap-[1vw] text-black">
                    <span className="relative h-[25px] w-[25px] shrink-0 min-[1301px]:h-[31px] min-[1301px]:w-[31px]">
                      {iconImage ? (
                        <Image src={iconImage} alt="" fill sizes="31px" className="object-contain" />
                      ) : (
                        <Icon className="h-full w-full stroke-[1.25]" />
                      )}
                    </span>
                    <span>
                      <span className="mb-[2px] block text-[12px] font-normal leading-[1.2em]">{item.title}</span>
                      {item.subtitle ? (
                        <span className="block text-[12px] font-bold leading-[16px]">{item.subtitle}</span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {compact ? (
            // Compact sticky header: small logo, 55px tall (reference: 98×55).
            <div className="flex items-center justify-center">
              {logoImage("max-h-[55px] w-auto max-w-[98px] object-contain", stickyLogo ?? logo)}
            </div>
          ) : (
            <div className="flex items-end justify-center pb-[6px]">{logoImage("w-[117px]")}</div>
          )}

          <div className={`flex flex-col ${compact ? "justify-center" : "justify-between pt-[16px] pb-[16px]"}`}>
            {/* Elementor 3-col grid on the reference: 126px cells, 20px gap,
                pinned to the outer (left) edge; last cell centered. */}
            <div className={`h-[40px] items-center justify-end gap-[20px] ${compact ? "hidden" : "flex"}`}>
              {linksLeft.map((link, i) => (
                <div
                  key={link.id}
                  className={`flex w-[126px] ${i === linksLeft.length - 1 ? "justify-center" : "justify-start"}`}
                >
                  <TopBarLink link={link} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-[3%]">
              {/* Results dropdown spans the whole header container (the
                  grid below is its positioned ancestor), like the reference. */}
              <HeaderSearch
                columns="row"
                formClassName="relative flex h-[46px] flex-1 items-center pr-[calc(4vw+5px)]"
                inputClassName="h-full w-full rounded-[35px] border border-[#eee] bg-[#eee] pe-[50px] ps-[15px] text-[14px] text-black outline-none placeholder:text-black"
                buttonClassName="absolute left-0 flex h-[46px] w-[50px] items-center justify-center text-black transition-colors hover:text-[rgba(51,51,51,.6)]"
                iconClassName="h-5 w-5 stroke-[2]"
                dropdownClassName="absolute inset-x-[15px] top-[calc(100%-10px)]"
              />

              {cartTrigger(true)}

              <Link
                href="/account/login"
                aria-label="החשבון שלי"
                className="flex h-[40px] items-center px-[10px] transition-opacity hover:opacity-60"
              >
                <Image src="/brand/user.svg" alt="" width={18} height={14} unoptimized className="w-[18px]" />
              </Link>

              <Link
                href="/wishlist"
                dir="ltr"
                aria-label="רשימת המשאלות"
                className="flex h-[40px] items-center px-[10px] transition-opacity hover:opacity-60"
              >
                <span className="relative">
                  <Image src="/brand/like.svg" alt="" width={18} height={15} unoptimized className="w-[18px]" />
                  {countBadge(wishlistCount)}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet — "כל הקטגוריות" menu on the right, centered logo,
          cart icon on the left; always-visible search row below. */}
      <div className="border-b border-[rgba(129,129,129,.2)] lg:hidden">
        <div className="grid h-[61px] grid-cols-[1fr_auto_1fr] items-center px-[15px]">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="תפריט"
            className="flex items-center justify-self-start text-[#333]"
          >
            <Menu className="h-5 w-5 stroke-[1.75]" />
            <span className="mr-[2px] text-[12px] font-normal tracking-[-0.3px] [word-spacing:-0.5px]">כל הקטגוריות</span>
          </button>

          {logoImage("w-[120px] max-h-[55px] object-contain")}

          <div className="justify-self-end">{cartTrigger(false)}</div>
        </div>
      </div>

      <div className="relative flex h-[50px] items-center px-[15px] lg:hidden">
        <HeaderSearch
          columns="list"
          formClassName="relative w-full"
          inputClassName="h-[42px] w-full rounded-[5px] border border-[#d52027] bg-white pe-[42px] ps-[15px] text-[14px] text-black outline-none placeholder:text-black/40"
          buttonClassName="absolute inset-y-0 left-0 flex w-[42px] items-center justify-center text-black"
          iconClassName="h-[18px] w-[18px] stroke-[2]"
          dropdownClassName="absolute inset-x-[15px] top-full max-h-[70vh] overflow-y-auto"
        />
      </div>

      {/* Category nav — driven entirely by the admin-managed tree from
          GET /wp-json/tamar/v1/menu (see includes/class-header-menu.php on
          the WP side). Each item with children renders as a mega-menu
          trigger; an item with no children is a plain link. Woodmart
          "separated" style: 60px red bar, wraps onto extra rows. */}
      <nav ref={categoryNavRef} className="relative hidden bg-[#d52027] lg:block">
        <div
          className={`mx-auto flex max-w-[1600px] flex-wrap content-center items-center justify-center gap-y-[6px] px-[15px] ${
            compact ? "min-h-[54px] py-[3px]" : "min-h-[60px] py-[5px]"
          }`}
        >
          {menu.map((item) => {
            // Reference values: 14px/700 white (12–13px and 11px on narrower
            // screens, per the site's own breakpoints), 20px item gap (11px
            // at 1025–1115px), 18px-tall rgba(255,255,255,.25) separators,
            // hover/active rgba(255,255,255,.8).
            const itemClass = (active: boolean) =>
              `relative flex min-h-[22px] shrink-0 items-center px-[5.5px] text-[11px] font-bold uppercase leading-[1.2] transition-colors min-[1116px]:px-[10px] min-[1216px]:text-[12px] min-[1426px]:text-[13px] min-[1508px]:text-[14px] after:absolute after:top-1/2 after:left-0 after:h-[18px] after:-translate-y-1/2 after:border-r after:border-white/25 after:content-[''] last:after:hidden hover:text-white/80 ${
                active ? "text-white/80" : "text-white"
              }`;

            if (item.children.length === 0) {
              return (
                <Link key={item.id} href={item.url} className={itemClass(isActiveHref(item.url))}>
                  {decodeHtml(item.label)}
                </Link>
              );
            }

            const isOpen = menuVisible && openItemId === item.id;
            const active = isOpen || decodedPathname.startsWith(trimTrailingSlash(item.url));
            // A real link to the category (as on the reference): hover or
            // keyboard focus opens the mega panel, click navigates.
            return (
              <Link
                key={item.id}
                href={item.url}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onMouseEnter={(e) => openMenu(item, e)}
                onFocus={(e) => openMenu(item, e)}
                onMouseLeave={scheduleCloseMenu}
                onClick={() => setMenuVisible(false)}
                className={itemClass(active)}
              >
                {decodeHtml(item.label)}
                <ChevronDown
                  className={`ms-[4px] h-[9px] w-[9px] stroke-[3] text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </Link>
            );
          })}
        </div>

        {/* Page dim behind the open panel (Woodmart "wd-with-overlay"):
            starts at the nav's bottom edge so the header itself stays lit. */}
        <div
          aria-hidden
          onMouseEnter={scheduleCloseMenu}
          onClick={() => setMenuVisible(false)}
          style={{ top: overlayTop }}
          className={`fixed inset-x-0 bottom-0 bg-black/70 transition-opacity duration-200 ${
            menuVisible && panelItem ? "visible opacity-100" : "invisible opacity-0"
          }`}
        />

        {/* Mega panel — full container width, 10px below the hovered
            item's row; the ::before strip bridges that gap for hover. */}
        {panelItem ? (
          <div
            onMouseEnter={cancelCloseMenu}
            onMouseLeave={scheduleCloseMenu}
            style={{ top: menuTop, maxHeight: `calc(100vh - ${overlayTop}px - 20px)` }}
            className={`absolute inset-x-0 z-50 mx-auto w-full max-w-[1590px] overflow-y-auto bg-white shadow-[0_0_3px_rgba(0,0,0,.15)] transition-opacity duration-200 before:absolute before:inset-x-0 before:-top-[10px] before:h-[10px] before:content-[''] ${
              menuVisible ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            {/* Measured against the live reference (1920px): title 28px/300,
                list 17px/300 black on #777 bullets, 4 cols ~290px apart,
                68px row pitch, 42px bordered pill buttons. Buttons use 17px
                bold, not the reference's declared 16px/900: on Windows, Arial
                at 900 resolves to Arial Black (no Hebrew glyphs) and renders
                garbled — 17px bold reproduces the reference's on-screen
                size exactly (182×42 / 140×42 pills). */}
            <div className="flex gap-[75px] px-[40px] pt-[20px] pb-[40px]">
              <div className="min-w-0 flex-1">
                <p className="mb-[60px] text-center text-[28px] font-light leading-[30px] text-black">
                  {decodeHtml(panelItem.featuredTitle || panelItem.label)}
                </p>

                {panelLinkChildren.some((c) => c.image) ? (
                  // Brand/sub-category cards (children with an image).
                  <div className="grid grid-cols-5 gap-x-[16px] gap-y-[20px] min-[1300px]:grid-cols-7">
                    {panelLinkChildren.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        onClick={() => setMenuVisible(false)}
                        className="flex h-[125px] flex-col items-center justify-between bg-white px-[10px] pt-[20px] pb-[18px] text-center shadow-[0_0_15px_rgba(0,0,0,.07)] transition-shadow hover:shadow-[0_0_18px_rgba(0,0,0,.14)]"
                      >
                        <span className="relative h-[45px] w-full">
                          {child.image ? (
                            <Image
                              src={child.image.url}
                              alt={child.image.alt || child.label}
                              fill
                              sizes="130px"
                              className="object-contain"
                            />
                          ) : null}
                        </span>
                        <span className="line-clamp-1 text-[16px] leading-[1.2] text-[#333]">{decodeHtml(child.label)}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  // Plain sub-category list — 4 columns, max 5 rows (20 items).
                  <ul className="grid grid-cols-4 gap-x-[40px] gap-y-[44px]">
                    {panelLinkChildren.slice(0, 20).map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.url}
                          onClick={() => setMenuVisible(false)}
                          className={`flex items-center gap-[8px] text-[16px] font-light leading-[25px] transition-colors hover:text-[#d52027] ${
                            isActiveHref(child.url) ? "text-[#d52027]" : "text-black"
                          }`}
                        >
                          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#777]" />
                          <span>{decodeHtml(child.label)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-[50px] flex justify-center">
                  <Link
                    href={panelItem.url}
                    onClick={() => setMenuVisible(false)}
                    className="flex h-[42px] items-center rounded-[35px] border-2 border-[#d52027] px-[20px] text-[17px] font-bold leading-[20px] text-[#d52027] transition-colors hover:bg-[#d52027] hover:text-white"
                  >
                    הצג את כל המוצרים
                  </Link>
                </div>
              </div>

              {panelFeature ? (
                <div className="flex w-[302px] shrink-0 flex-col pt-[15px]">
                  <Link
                    href={panelFeature.url}
                    onClick={() => setMenuVisible(false)}
                    className="relative block h-[438px] w-full bg-[#f7f7f7]"
                  >
                    {panelFeature.image ? (
                      <Image
                        src={panelFeature.image.url}
                        alt={panelFeature.image.alt}
                        fill
                        sizes="302px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                  {/* Short name: name + button on one row, as on the
                      reference. Long name: it takes the full width (never
                      squeezed into a narrow column) and the button wraps
                      below, pushed to the left edge. */}
                  <div className="mt-[30px] flex items-center gap-x-[20px]">
                    <Link
                      href={panelFeature.url}
                      onClick={() => setMenuVisible(false)}
                      className="min-w-0 flex-1 truncate text-[18px] font-bold leading-[26px] text-black transition-colors hover:text-[#d52027]"
                    >
                      {decodeHtml(panelFeature.label)}
                    </Link>
                    <Link
                      href={panelFeature.url}
                      onClick={() => setMenuVisible(false)}
                      className="flex h-[42px] shrink-0 items-center rounded-[35px] border-2 border-[#d52027] px-[21px] text-[17px] font-bold leading-[20px] text-[#d52027] transition-colors hover:bg-[#d52027] hover:text-white"
                    >
                      {panelFeature.cta}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu drawer */}
      <aside
        className={`fixed inset-y-0 end-0 z-50 flex w-[82%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
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
                  {decodeHtml(item.label)}
                </Link>
              );
            }

            const linkChildren = item.children.filter((c): c is HeaderMenuLinkChild => c.type === "link");
            const productChild = item.children.find((c): c is HeaderMenuProductChild => c.type === "product") ?? null;
            const featured = item.featuredCategory
              ? { ...item.featuredCategory, price: null }
              : productChild
                ? { label: productChild.label, url: productChild.url, image: productChild.image, price: productChild.price }
                : null;
            const isMobileOpen = mobileOpenId === item.id;

            return (
              <div key={item.id} className="border-b border-black/5">
                <button
                  type="button"
                  onClick={() => setMobileOpenId((id) => (id === item.id ? null : item.id))}
                  className="flex w-full items-center justify-between py-4 text-[22px] font-semibold text-black/85"
                >
                  {decodeHtml(item.label)}
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
                          {featured.price !== null ? (
                            <span className="text-sm font-bold text-brand-accent">{formatPrice(featured.price)}</span>
                          ) : null}
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
                        <span className="truncate">{decodeHtml(child.label)}</span>
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

          {[...linksRight, ...linksLeft].length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-black/5 py-4">
              {[...linksRight, ...linksLeft].map((link) => (
                <TopBarLink key={link.id} link={link} />
              ))}
            </div>
          ) : null}
        </nav>

        <div className="mt-auto border-t border-black/5 px-5 py-4 text-xs text-black/40">
          משלוח חינם בקנייה מעל 349 ₪
        </div>
      </aside>
    </header>
    </div>
  );
}
