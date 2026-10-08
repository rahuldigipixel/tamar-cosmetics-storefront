import { cache } from "react";
import { wpEnv } from "./env";
import { logApiCall } from "./apiAuditLog";
import { localizeMediaUrls } from "./mediaUrl";
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
    return JSON.parse(localizeMediaUrls(await res.text())) as T;
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
  /** pa_brand term IDs curated in wp-admin → הגדרות מותגים to show on the /מותג/ brand list page. Empty = show all. */
  selectedBrandIds: number[];
  /** Title/description for the /מותג/ page, set in wp-admin → הגדרות מותגים. Empty string when unset. */
  brandPageTitle: string;
  brandPageDescription: string;
  /** Third-party IDs from wp-admin → הגדרות תמר → הגדרות כלליות; each is "" when unset (use resolveIntegrations() for defaults). */
  /** Free-shipping progress bar target + messages (wp-admin → הגדרות כלליות); use resolveFreeShipping() for defaults. */
  freeShipping?: Partial<import("@/lib/utils/freeShipping").FreeShippingConfig>;
  /** Free-shipping badge on product images (wp-admin → הגדרות עמוד מוצר); use resolveShippingBadge() for defaults. */
  shippingBadge?: Partial<import("@/lib/utils/shippingBadge").ShippingBadgeConfig> | null;
  integrations?: {
    flashyAccountId: string;
    flashyReviewsElementId: string;
    flashyLegacySiteOrigin: string;
    whatsappNumber: string;
  };
}

export interface HeaderMenuImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/** Lean menu image (rendered with next/image `fill`, so no width/height); alt falls back to the label. */
export interface HeaderMenuThumb {
  url: string;
  alt?: string;
}

export interface HeaderMenuLink {
  label: string;
  /** Relative path (decoded), absolute URL for external links, "" = no link. */
  url: string;
  /** Only set when the panel's "show images" checkbox is ticked and this link has an image. */
  image?: HeaderMenuThumb;
}

/** The panel's side advert column (wp-admin → mega menu → "עמודת פרסום"). */
export interface HeaderMenuFeature {
  text: string;
  /** Button label, e.g. "לצפייה במוצר". */
  btn: string;
  url: string;
  image: HeaderMenuThumb | null;
}

/** Mega panel of a main menu item — managed in wp-admin → הגדרות תמר → כותרת (Header) → תפריט ראשי. */
export interface HeaderMenuMega {
  title: string;
  /** "Normal dropdown" checkbox: just a small white list of the links (like "עוד"), not the big panel. */
  simple: boolean;
  /** Ticked: links render as image + caption cards instead of the bullet list. */
  showImages: boolean;
  /** Label of the "show all" pill button (links to the main item's URL); "" = no button. */
  allBtn: string;
  links: HeaderMenuLink[];
  feature: HeaderMenuFeature | null;
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  url: string;
  /** null = plain link (no dropdown). */
  mega: HeaderMenuMega | null;
}

export interface CategoryBanner {
  desktop: HeaderMenuImage | null;
  mobile: HeaderMenuImage | null;
}

export interface CategoryInfo {
  /** null = no such category (the only case the page 404s on). */
  name: string | null;
  description: string;
  /** "קרא עוד" accordion HTML (term meta category_extra_description_text). */
  readMore?: string | null;
  /** FAQ accordion HTML (term meta product_cat_extra_desc). */
  extraDescription?: string | null;
  banner: CategoryBanner;
  /** Empty unless "Enable Category Carousel" is ticked in the category's wp-admin settings. */
  carousel?: CategoryCarouselItem[] | null;
}

export interface CategoryCarouselItem {
  title: string;
  /** Relative path for this/the live site (decoded), absolute URL otherwise, "" = no link. */
  link: string;
  image: HeaderMenuImage | null;
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

export interface FooterImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface FooterItem {
  /** link = label+url, text = small HTML, image = clickable image, social = social-network button. */
  kind: "link" | "text" | "image" | "social";
  /** Extra space above the item in px (wp-admin "מרווח מעל הפריט"). */
  gap: number;
  url?: string;
  newTab?: boolean;
  label?: string;
  /** Already sanitized on the WP side (only <a>, <br>, <strong>, <b>). */
  html?: string;
  /** One of Tamar_Footer::SOCIAL_CHOICES — see SOCIAL in Footer.tsx. */
  social?: string;
  image?: FooterImage;
  imagePos?: "none" | "start" | "end" | "above";
}

export interface FooterColumn {
  id: string;
  title: string;
  /** Optional heading used instead of `title` on mobile. */
  mobileTitle: string;
  /** Side-by-side sub-lists; most columns have exactly one. */
  groups: FooterItem[][];
}

/** Managed from wp-admin → הגדרות תמר → פוטר (Footer) — see includes/class-footer.php. */
export interface FooterData {
  background: FooterImage | null;
  /** Payment-logos strip, shown on mobile only. */
  paymentsImage: FooterImage | null;
  /** Mobile-only copyright line + links (sanitized HTML: a / br / strong). */
  copyrightHtml?: string;
  brand: {
    social: { id: string; type: string; url: string }[];
    badge: { url: string; textImage: FooterImage | null; iconImage: FooterImage | null } | null;
  };
  columns: FooterColumn[];
}

export interface GlobalData {
  menu: HeaderMenuItem[];
  settings: SiteSettings | null;
  headerBar: HeaderBar | null;
  footer?: FooterData | null;
  /** Stylesheet for the Advanced Product Labels HTML on products (`Product.labelsHtml`). */
  labelsCss?: string;
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
  /** Optional website the commenter entered. */
  authorUrl?: string;
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

// Managed from wp-admin → הגדרות תמר → ניהול דף הבית (includes/class-home-page-settings.php).
// Delivered inside the GetHomeData GraphQL request (`tamarHomePage`, see
// lib/wpgraphql/home.ts) — the home page makes no separate REST call for it.

export interface ClubSignupInput {
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  /** "home" = the home page form, which has its own email settings in wp-admin. */
  source?: "home";
}

export function subscribeClub(input: ClubSignupInput) {
  return tamarFetch<{ success: boolean }>(`/club-signup`, {
    method: "POST",
    body: JSON.stringify({ name: input.name, email: input.email, phone: input.phone, birthday: input.birthday, source: input.source }),
  });
}

// "Back In Stock Notifier for WooCommerce" signup for an out-of-stock product (see class-stub-routes.php).
export function subscribeBackInStock(productId: number, email: string) {
  return tamarFetch<{ success: boolean; alreadySubscribed: boolean; message?: string }>(`/back-in-stock`, {
    method: "POST",
    body: JSON.stringify({ productId, email }),
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

export interface AppPageImage {
  url: string;
  /** 0 when the image is a legacy-site default (size unknown). */
  width: number;
  height: number;
}

export interface AppPage {
  heroImage: AppPageImage | null;
  /** Line breaks = separate title lines. */
  heroTitle: string;
  heroText: string;
  downloadTitle: string;
  appStoreUrl: string;
  appStoreImage: AppPageImage | null;
  googlePlayUrl: string;
  googlePlayImage: AppPageImage | null;
  featuresTitle: string;
  featuresImage: AppPageImage | null;
  /** Up to 4 numbered benefits (blank ones are dropped server-side). */
  features: { title: string; text: string }[];
  couponText: string;
  couponCode: string;
  couponLabel: string;
  videoTitle: string;
  videoUrl: string;
  videoPoster: AppPageImage | null;
  videoDownloadLabel: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → אפליקציית תמר (includes/class-app-page-settings.php).
 * `cache()`-wrapped so generateMetadata() and the page body share one request.
 */
export const getAppPage = cache(function getAppPage() {
  return tamarFetch<AppPage>(`/app-page`, {
    tags: ["app-page"],
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

export interface ShippingMethodPage {
  heading: string;
  contentHtml: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → שיטת שילוח תמר קוסמטיקס
 * (includes/class-shipping-method-page.php). `cache()`-wrapped so
 * generateMetadata() and the page body share one request.
 */
export const getShippingMethodPage = cache(function getShippingMethodPage() {
  return tamarFetch<ShippingMethodPage>(`/shipping-method-page`, {
    tags: ["shipping-method-page"],
    revalidate: 300,
  });
});

export interface ReturnPolicyPage {
  heading: string;
  contentHtml: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → מדיניות – החזר מוצר
 * (includes/class-return-policy-page.php). `cache()`-wrapped so
 * generateMetadata() and the page body share one request.
 */
export const getReturnPolicyPage = cache(function getReturnPolicyPage() {
  return tamarFetch<ReturnPolicyPage>(`/return-policy-page`, {
    tags: ["return-policy-page"],
    revalidate: 300,
  });
});

export interface FaqPage {
  heading: string;
  contentHtml: string;
  banner: { url: string; width: number; height: number; alt: string } | null;
  /** Image shown under the text box (second upload field on the FAQ settings screen). */
  bottomImage: { url: string; width: number; height: number; alt: string } | null;
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → שאלות נפוצות
 * (includes/class-simple-pages.php). `cache()`-wrapped so generateMetadata()
 * and the page body share one request.
 */
export const getFaqPage = cache(function getFaqPage() {
  return tamarFetch<FaqPage>(`/faq-page`, { tags: ["faq-page"], revalidate: 300 });
});

export interface OrderCancellationPage {
  heading: string;
  contentHtml: string;
  form: { heading: string; checkboxLabel: string; buttonLabel: string };
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → ביטול עסקה
 * (includes/class-simple-pages.php). `cache()`-wrapped so generateMetadata()
 * and the page body share one request.
 */
export const getOrderCancellationPage = cache(function getOrderCancellationPage() {
  return tamarFetch<OrderCancellationPage>(`/order-cancellation-page`, {
    tags: ["order-cancellation-page"],
    revalidate: 300,
  });
});

/** POST target of a wp-admin "simple page" form (includes/class-simple-pages.php) — `route` is the plugin's form route. */
export function submitPageLead(route: string, input: WholesaleLeadInput) {
  return tamarFetch<{ success: boolean }>(`/${route}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface ContactPage {
  heading: string;
  description: string;
  /** Left-column rows from the wp-admin "add more" list: text/links HTML + optional icon. */
  items: { html: string; tight: boolean; muted: boolean; icon: { url: string; size: number; alt: string } | null }[];
  form: { heading: string; checkboxLabel: string; buttonLabel: string };
}

export interface SuppliersPage {
  heading: string;
  subheading: string;
  description: string;
  highlight: string;
  items: ContactPage["items"];
  form: { heading: string; checkboxLabel: string; buttonLabel: string; nameLabel: string };
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → ספקים
 * (includes/class-simple-pages.php). `cache()`-wrapped so generateMetadata()
 * and the page body share one request.
 */
export const getSuppliersPage = cache(function getSuppliersPage() {
  return tamarFetch<SuppliersPage>(`/suppliers-page`, { tags: ["suppliers-page"], revalidate: 300 });
});

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → צור קשר
 * (includes/class-simple-pages.php). `cache()`-wrapped so
 * generateMetadata() and the page body share one request.
 */
export const getContactPage = cache(function getContactPage() {
  return tamarFetch<ContactPage>(`/contact-page`, { tags: ["contact-page"], revalidate: 300 });
});

export interface TermsPage {
  heading: string;
  contentHtml: string;
}

/**
 * Managed from wp-admin → הגדרות תמר → עמודים → תקנון האתר
 * (includes/class-simple-pages.php). `cache()`-wrapped so
 * generateMetadata() and the page body share one request.
 */
export const getTermsPage = cache(function getTermsPage() {
  return tamarFetch<TermsPage>(`/terms-page`, { tags: ["terms-page"], revalidate: 300 });
});

export interface ContentPageData {
  heading: string;
  contentHtml: string;
}

/**
 * Any "heading + editor" page managed from wp-admin → הגדרות תמר → עמודים
 * (includes/class-simple-pages.php), by its REST route. `cache()`-wrapped per
 * route so generateMetadata() and the page body share one request.
 */
export const getContentPage = cache(function getContentPage(route: string) {
  return tamarFetch<ContentPageData>(`/${route}`, { tags: [route], revalidate: 300 });
});

export interface AboutImage {
  url: string;
  /** Original-size image for the lightbox (same as url when there is no separate one). */
  full: string;
  alt: string;
}

export interface AboutPageData {
  heading: string;
  contentHtml: string;
  videoUrl: string;
  slider: AboutImage[];
  certTitle: string;
  certText: string;
  gallery: AboutImage[];
  teamTitle: string;
  cards: { title: string; text: string }[];
}

/**
 * wp-admin → הגדרות תמר → עמודים → אודות החברה (includes/class-simple-pages.php):
 * video, text, 3-up slider, certificates title/text, lightbox gallery, team cards.
 */
export const getAboutPage = cache(function getAboutPage() {
  return tamarFetch<AboutPageData>(`/about-company-page`, { tags: ["about-company-page"], revalidate: 300 });
});

export interface FlagshipPageData {
  heading: string;
  /** Centered intro (title lines + paragraph) above the first row. */
  contentHtml: string;
  /** Row 1, right column: paragraph + bullet list. */
  productsHtml: string;
  /** Row 1, left column: Google Maps place/address text, or a full embed URL. */
  mapQuery: string;
  /** Row 2, right column: YouTube link, then `hoursHtml` under it. */
  videoUrl: string;
  hoursHtml: string;
  /** Row 2, left column. */
  visitHtml: string;
  slider: AboutImage[];
}

/**
 * wp-admin → הגדרות תמר → עמודים → סניף הדגל ירושלים (includes/class-simple-pages.php):
 * intro, products text + map, video + hours + visit text, 3-up photo slider.
 */
export const getFlagshipPage = cache(function getFlagshipPage() {
  return tamarFetch<FlagshipPageData>(`/flagship-branch-page`, { tags: ["flagship-branch-page"], revalidate: 300 });
});

/**
 * GoCredit payment status (includes/class-checkout-payment.php). Authorised by the WooCommerce order key,
 * keeps the backend's error message, same timeout as the rest.
 */
export async function checkoutPaymentRequest<T>(
  path: "/checkout/payment-status",
  params: Record<string, string | number>,
  method: "GET" | "POST"
): Promise<{ ok: boolean; status: number; data: T | { message?: string } | null }> {
  logApiCall("REST", path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 2); // GoCredit's SOAP call can take a few seconds
  try {
    const query = method === "GET" ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
    const res = await fetch(`${TAMAR_API_BASE}${path}${query}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(params) : undefined,
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
