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
  /** Compact sticky-header logo (wp-admin → כותרת → "לוגו כותרת מוקטנת (בגלילה)"); null = reuse headerLogo. */
  headerStickyLogo?: SiteLogo | null;
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
  /** Promoted category shown beside the sub-links (wp-admin "קטגוריה מקודמת בתפריט"): its image (custom or the category's own thumbnail), name and link. Only on "category"-source items; null when none is picked. */
  featuredCategory?: HeaderMenuFeaturedCategory | null;
  children: HeaderMenuChild[];
}

export interface HeaderMenuFeaturedCategory {
  label: string;
  url: string;
  image: HeaderMenuImage | null;
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

/**
 * One product category by slug — name/description plus its desktop/mobile
 * banner (wp-admin → Products → Categories → Desktop/Mobile Banner; term meta
 * product_taxonomy_banner / product_taxonomy_mobile_banner — see the plugin's
 * includes/class-wc-product-module.php). Resolves any category, including
 * empty ones the GraphQL category list (hideEmpty) skips. One lean request,
 * run in parallel with the page's other data.
 */
export function getCategoryInfo(slug: string) {
  return tamarFetch<CategoryInfo>(`/category-info?slug=${encodeURIComponent(slug)}`, {
    tags: ["categories", `category-info:${slug}`],
    revalidate: 300,
  });
}

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
}

export interface HeaderBar {
  announcements: string[];
  linksRight: HeaderBarLink[];
  linksLeft: HeaderBarLink[];
  serviceIcons: HeaderServiceIcon[];
}

/**
 * Top-bar content managed from wp-admin → כותרת (Header) → פס עליון
 * (includes/class-header-bar.php): the rotating announcement messages, the
 * left/right link groups, and the service icon strip in the main header row.
 */
export function getHeaderBar() {
  return tamarFetch<HeaderBar>(`/header-bar`, {
    tags: ["header-bar"],
    revalidate: 300,
  });
}

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
  ctaButtonLabel: string;
  sliderImages: WholesaleImage[];
}

/** Managed from wp-admin → הגדרות תמר → מכירה סיטונאית (includes/class-content-pages.php). */
export function getWholesalePage() {
  return tamarFetch<WholesalePage>(`/wholesale-page`, {
    tags: ["wholesale-page"],
    revalidate: 300,
  });
}

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

/** Managed from wp-admin → עמודי תוכן → ביקורות לקוחות (includes/class-content-pages.php). */
export function getReviewsPage() {
  return tamarFetch<ReviewsPage>(`/reviews-page`, {
    tags: ["reviews-page"],
    revalidate: 300,
  });
}

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
