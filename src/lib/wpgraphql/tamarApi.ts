import { cache } from "react";
import { wpEnv } from "./env";
import { logApiCall } from "./apiAuditLog";
import type { ProductLabel } from "@/types/product";

const TAMAR_API_BASE = `${wpEnv.wordpressUrl}/wp-json/tamar/v1`;
const REQUEST_TIMEOUT_MS = 10_000;

interface TamarFetchOptions extends RequestInit {
  /** Cache tags for on-demand revalidation via revalidateTag() (see /api/revalidate). */
  tags?: string[];
  /** ISR interval in seconds. Omit (with the "no-store" default) for always-fresh, user-specific data. */
  revalidate?: number | false;
}

async function tamarFetch<T>(path: string, options: TamarFetchOptions = {}): Promise<T | null> {
  logApiCall("REST", path);
  const { tags, revalidate, cache, ...rest } = options;

  // Same fail-fast contract as fetchGraphQL: a stalled/unreachable backend
  // must not hang the page on its loading skeleton.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${TAMAR_API_BASE}${path}`, {
      ...rest,
      headers: { "Content-Type": "application/json", ...rest.headers },
      cache: cache ?? (tags || revalidate !== undefined ? undefined : "no-store"),
      next: cache === "no-store" ? undefined : { tags, revalidate },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // tamar-headless-api plugin may not be installed/activated yet on this backend,
    // or the request timed out — either way, callers treat null as "fall back".
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface WishlistItem {
  productId: number;
}

// Wishlist is logged-in-only, stored on WP user meta in the same serialized
// format the WoodMart theme already used pre-headless (see class-wishlist.php)
// — auth is the bearer token from /api/auth/login, not a client-generated id.
// Guests never call these; their wishlist lives entirely in a browser cookie
// (useWishlistStore.ts).
export function getWishlist(token: string) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
}

export function addToWishlist(token: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product_id: productId }),
  });
}

export function removeFromWishlist(token: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product_id: productId }),
  });
}

/** Stub route on the backend today — returns null until the tabs endpoint is implemented. */
export function getProductTabs(productId: number) {
  return tamarFetch<{ title: string; content: string }[]>(`/product-tabs/${productId}`);
}

/** Stub route on the backend today — returns null until the labels endpoint is implemented. */
export function getProductLabels(productId: number) {
  return tamarFetch<ProductLabel[]>(`/product-labels/${productId}`);
}

export function subscribeBackInStock(productId: number, email: string) {
  return tamarFetch<{ success: boolean }>(`/back-in-stock`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, email }),
  });
}

export interface SiteLogo {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface SiteSettings {
  headerLogo: SiteLogo | null;
  /** Compact sticky-header logo (wp-admin → כותרת → "לוגו כותרת מוקטנת (בגלילה)"); null = reuse headerLogo. */
  headerStickyLogo?: SiteLogo | null;
  footerLogo: SiteLogo | null;
  /** Brand slugs curated in wp-admin → הגדרות תמר to show on the /מותג/ brand list page. Empty = show all. */
  selectedBrandSlugs: string[];
  /** Title/description for the /מותג/ page, set in wp-admin → הגדרות מותגים. Empty string when unset. */
  brandPageTitle: string;
  brandPageDescription: string;
}

export interface HeaderMenuImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface HeaderMenuLinkChild {
  id: string;
  type: "link";
  label: string;
  url: string;
  /** Optional logo/thumbnail (e.g. brand logo). When any child in a panel has one, the mega menu renders cards instead of a bullet list. */
  image?: HeaderMenuImage | null;
}

export interface HeaderMenuProductChild {
  id: string;
  type: "product";
  productId: number;
  label: string;
  url: string;
  price: number;
  image: HeaderMenuImage | null;
}

export type HeaderMenuChild = HeaderMenuLinkChild | HeaderMenuProductChild;

export interface HeaderMenuItem {
  id: string;
  label: string;
  url: string;
  /** "כותרת פנימית" from wp-admin — a heading for the mega panel itself (e.g. "המוצר המומלץ שלנו"), not a replacement for the featured product's own name. Only set on "category"-source items; empty string otherwise. */
  featuredTitle?: string;
  /** Custom label shown next to the "view category" button in the mega panel. Falls back to the promoted category's own name when empty. Only on "category"-source items. */
  featuredBtnLabel?: string;
  /** Promoted category shown beside the sub-links (wp-admin "קטגוריה מקודמת בתפריט"): its image (custom or the category's own thumbnail), name and link. Only on "category"-source items; null when none is picked. */
  featuredCategory?: HeaderMenuFeaturedCategory | null;
  children: HeaderMenuChild[];
}

export interface HeaderMenuFeaturedCategory {
  label: string;
  url: string;
  image: HeaderMenuImage | null;
}

export interface CategoryBanner {
  desktop: HeaderMenuImage | null;
  mobile: HeaderMenuImage | null;
}

export interface CategoryInfo {
  /** null = no such category (the only case the page 404s on). */
  name: string | null;
  description: string;
  banner: CategoryBanner;
}

// The REST route (GET /category-info) behind this data still exists on the
// plugin for any other consumer, but the Next.js app now reads it via the
// `tamarCategoryInfo` GraphQL field folded into GET_CATEGORY_PAGE_DATA (see
// lib/wpgraphql/categoryPage.ts) instead of a standalone request — both
// share the plugin's resolve_category_info() so behavior is identical.

export interface HeaderBarLink {
  id: string;
  label: string;
  url: string;
}

export interface HeaderServiceIcon {
  id: string;
  /** One of Tamar_Header_Bar::ICON_CHOICES on the WP side — see SERVICE_ICON_MAP in Header.tsx. */
  icon: string;
  title: string;
  subtitle: string;
  /** Optional admin-set link; the item is only rendered as a link when non-empty. */
  url?: string;
}

export interface HeaderBar {
  announcements: string[];
  linksRight: HeaderBarLink[];
  linksLeft: HeaderBarLink[];
  serviceIcons: HeaderServiceIcon[];
}

export interface GlobalData {
  menu: HeaderMenuItem[];
  settings: SiteSettings | null;
  headerBar: HeaderBar | null;
}

/**
 * Menu + site settings (logo) + header bar in ONE request instead of three
 * separate round trips — see the plugin's /global-data endpoint
 * (includes/class-settings.php get_global_data(), which folds together the
 * same data get_menu()/get_settings()/get_header_bar() each used to return
 * on their own). Wrapped in React `cache()` so the root layout and any page
 * that also needs a piece of this (e.g. /brand-list needs settings) share
 * one network call per request instead of issuing it twice.
 */
export const getGlobalData = cache(function getGlobalData() {
  return tamarFetch<GlobalData>(`/global-data`, {
    tags: ["header-menu", "site-settings", "header-bar"],
    revalidate: 300,
  });
});

export interface WholesaleImage {
  id: number;
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface WholesalePage {
  heading: string;
  contentHtml: string;
  ctaHeading: string;
  /** Single image shown beside the CTA form — distinct from sliderImages, the bottom photo strip. */
  heroImage: WholesaleImage | null;
  ctaCheckboxLabel: string;
  ctaButtonLabel: string;
  sliderImages: WholesaleImage[];
}

/**
 * Managed from wp-admin → הגדרות תמר → מכירה סיטונאית (includes/class-content-pages.php).
 * Wrapped in `cache()` — called from both generateMetadata() and the page
 * body — so the two share one request instead of relying on Next's fetch
 * memoization to collapse them implicitly.
 */
export const getWholesalePage = cache(function getWholesalePage() {
  return tamarFetch<WholesalePage>(`/wholesale-page`, {
    tags: ["wholesale-page"],
    revalidate: 300,
  });
});

export interface WholesaleLeadInput {
  name: string;
  email: string;
  phone: string;
}

export function submitWholesaleLead(input: WholesaleLeadInput) {
  return tamarFetch<{ success: boolean }>(`/wholesale-lead`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface ReviewsPage {
  heading: string;
  descriptionHtml: string;
}

/**
 * Managed from wp-admin → עמודי תוכן → ביקורות לקוחות (includes/class-content-pages.php).
 * Wrapped in `cache()` — called from both generateMetadata() and the page
 * body — so the two share one request instead of relying on Next's fetch
 * memoization to collapse them implicitly.
 */
export const getReviewsPage = cache(function getReviewsPage() {
  return tamarFetch<ReviewsPage>(`/reviews-page`, {
    tags: ["reviews-page"],
    revalidate: 300,
  });
});

export interface BlogCommentInput {
  postId: number;
  authorName: string;
  authorEmail: string;
  content: string;
}

/**
 * WP core's own REST API refuses anonymous comment creation outright — this
 * goes through includes/class-blog.php instead, which calls wp_new_comment()
 * server-side. Reading comments doesn't need this: GET /wp/v2/comments is
 * already public (see getPostComments() in lib/wpgraphql/posts.ts).
 */
export function submitBlogComment(input: BlogCommentInput) {
  return tamarFetch<{ success: boolean; approved: boolean }>(`/blog-comment`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface HomePageSlide {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  /** Optional destination link for the slide (e.g. /shop) — empty string when unset. */
  link: string;
}

export interface HomePageRailSettings {
  title: string;
  description: string;
  /** Product database IDs curated in wp-admin (search-by-name/SKU multiselect), in display order. Empty = use the section's default product list (see pickRailProducts() in page.tsx). */
  productIds: number[];
}

export type HomePageSaleSettings = HomePageRailSettings;

export interface HomePageFeature {
  /** "lucide" (use `icon` below) or "image" (use `iconImage`, an admin-uploaded SVG/image). */
  iconType: "lucide" | "image";
  /** One of Tamar_Home_Page_Settings::FEATURE_ICON_CHOICES on the WP side — see FEATURE_ICON_MAP in featureIconMap.ts. */
  icon: string;
  iconImage: SiteLogo | null;
  title: string;
  subtitle: string;
  /** Optional destination link (e.g. /shop) — empty string when unset. */
  link: string;
}

export interface HomePageSettings {
  heroDesktop: HomePageSlide[];
  heroMobile: HomePageSlide[];
  categoryHeading: string;
  categorySlugs: string[];
  brandHeading: string;
  brandSlugs: string[];
  hot: HomePageRailSettings;
  club: {
    heading: string;
    description: string;
    bgImage: SiteLogo | null;
  };
  new: HomePageRailSettings;
  sale: HomePageSaleSettings;
  features: HomePageFeature[];
  aboutTitle: string;
  aboutContentHtml: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → ניהול דף הבית (includes/class-home-page-settings.php).
 * Only carries *which* categories/brands/products to show and what text to
 * display — the Next.js home page already has the full category/brand/
 * product objects from getHomeData() (WPGraphQL), so this stays a lean 3rd
 * call rather than duplicating that data (same budget as /wholesale-page).
 */
export const getHomePageSettings = cache(function getHomePageSettings() {
  return tamarFetch<HomePageSettings>(`/home-page`, {
    tags: ["home-page"],
    revalidate: 300,
  });
});

export interface ClubSignupInput {
  name: string;
  email: string;
  phone: string;
  birthday?: string;
}

export function subscribeClub(input: ClubSignupInput) {
  return tamarFetch<{ success: boolean }>(`/club-signup`, {
    method: "POST",
    body: JSON.stringify({ name: input.name, email: input.email, phone: input.phone, birthday: input.birthday }),
  });
}

export interface SecretClubColumn {
  title: string;
  text: string;
}

export interface SecretClubPage {
  heading: string;
  contentHtml: string;
  /** Always 4 entries (columns 1-4), even when left blank in wp-admin. */
  columns: SecretClubColumn[];
  ctaHeading: string;
  ctaDescription: string;
  /** Image shown beside the signup form — same shape as WholesaleImage. */
  ctaImage: WholesaleImage | null;
  ctaCheckboxLabel: string;
  ctaButtonLabel: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → הנבחרת הסודית (includes/class-content-pages.php).
 * Wrapped in `cache()` — called from both generateMetadata() and the page
 * body — so the two share one request instead of relying on Next's fetch
 * memoization to collapse them implicitly.
 */
export const getSecretClubPage = cache(function getSecretClubPage() {
  return tamarFetch<SecretClubPage>(`/secret-club-page`, {
    tags: ["secret-club-page"],
    revalidate: 300,
  });
});

export interface OrderSummary {
  id: number;
  number: string;
  date: string;
  status: string;
  statusLabel: string;
  total: number;
  itemCount: number;
}

export interface OrderDetail {
  id: number;
  number: string;
  date: string;
  status: string;
  statusLabel: string;
  items: { name: string; quantity: number; total: number; meta: { label: string; value: string }[] }[];
  subtotal: number;
  discount: number;
  shippingTotal: number;
  shippingMethod: string;
  paymentMethod: string;
  total: number;
  note: string;
  billing: {
    name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    phone: string;
    email: string;
  };
}

// Logged-in customer's own orders (includes/class-orders.php) — user-specific,
// so never cached; the bearer token is what scopes the result.
export function getOrders(token: string) {
  return tamarFetch<OrderSummary[]>(`/orders`, { headers: { Authorization: `Bearer ${token}` } });
}

export function getOrder(token: string, id: number) {
  return tamarFetch<OrderDetail>(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  country: string;
  /** Stored in billing_state — see mutations/checkout.ts. */
  city: string;
  address_1: string;
  address_2: string;
  appartment: string;
  postcode: string;
  phone: string;
  email: string;
}

export interface AccountProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  /** New address awaiting confirmation via the emailed link (WP's _new_email flow); "" when none. */
  pendingEmail: string;
  /** Only on the save response: whether the confirmation email went out. */
  emailSent?: boolean;
}

export type AccountSection = "billing" | "profile" | "confirm-email" | "cancel-email";

/**
 * Logged-in account read/write (includes/class-account.php). Unlike
 * tamarFetch this keeps the backend's error message (e.g. "wrong current
 * password") so the form can show it, while keeping the same timeout.
 */
export async function accountRequest<T>(
  section: AccountSection,
  token: string,
  body?: unknown
): Promise<{ ok: boolean; status: number; data: T | { message?: string } | null }> {
  const path = `/account/${section}`;
  logApiCall("REST", path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${TAMAR_API_BASE}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  } finally {
    clearTimeout(timer);
  }
}
