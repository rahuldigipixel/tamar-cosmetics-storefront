import { wpEnv } from "./env";
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

export function getWishlist(wishlistId: string) {
  return tamarFetch<WishlistItem[]>(`/wishlist?wishlist_id=${encodeURIComponent(wishlistId)}`);
}

export function addToWishlist(wishlistId: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "POST",
    body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId }),
  });
}

export function removeFromWishlist(wishlistId: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "DELETE",
    body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId }),
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
  footerLogo: SiteLogo | null;
  /** Brand slugs curated in wp-admin → הגדרות תמר to show on the /מותג/ brand list page. Empty = show all. */
  selectedBrandSlugs: string[];
  /** Title/description for the /מותג/ page, set in wp-admin → הגדרות מותגים. Empty string when unset. */
  brandPageTitle: string;
  brandPageDescription: string;
}

/**
 * Header/footer logo (and any other future site-wide setting) is managed
 * from wp-admin → "הגדרות תמר" (includes/class-settings.php) instead of
 * being a static file in this repo. Cached for an hour as a fallback; the
 * plugin also pings /api/revalidate with the "site-settings" tag on save,
 * so an edit normally shows up immediately rather than after the full hour.
 */
export function getSiteSettings() {
  return tamarFetch<SiteSettings>(`/settings`, {
    tags: ["site-settings"],
    revalidate: 3600,
  });
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
  children: HeaderMenuChild[];
}

/**
 * Admin-managed nav tree from wp-admin → כותרת (Header) → תפריט ראשי
 * (includes/class-header-menu.php). A "category" item's children are always
 * that category's live WooCommerce subcategories plus (optionally) one
 * featured product — resolved server-side on every request, so this never
 * needs re-deriving from the categories list on the React side.
 */
export function getHeaderMenu() {
  return tamarFetch<HeaderMenuItem[]>(`/menu`, {
    tags: ["header-menu"],
    revalidate: 300,
  });
}

export interface ClubSignupInput {
  name: string;
  email: string;
  phone: string;
  birthday?: string;
}

/** Stub route on the backend today — returns null until tamar-headless-api implements it. */
export function subscribeClub(input: ClubSignupInput) {
  return tamarFetch<{ success: boolean }>(`/club-signup`, {
    method: "POST",
    body: JSON.stringify({ name: input.name, email: input.email, phone: input.phone, birthday: input.birthday }),
  });
}
