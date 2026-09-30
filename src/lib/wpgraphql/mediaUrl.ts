import { wpEnv } from "./env";

/**
 * When the WordPress backend is served over plain http (e.g. a dev host with no
 * valid SSL cert), an https storefront can't load its images directly — the
 * browser blocks them as mixed content. next.config.ts proxies
 * `/wp-content/uploads/*` to the backend server-side; this rewrites absolute
 * upload URLs in backend responses to that same-origin relative path so the
 * browser never sees the http:// URL. No-op once the backend is https.
 */
const httpHost = wpEnv.wordpressUrl.startsWith("http://") ? wpEnv.wordpressUrl.slice("http://".length) : null;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Matches both raw and JSON-escaped (`http:\/\/host\/wp-content\/uploads`) forms,
// with either scheme (WordPress may emit https:// links for its own host).
const pattern = httpHost
  ? new RegExp(`https?:(?:\\\\?/){2}${escapeRegExp(httpHost).replace(/\//g, "(?:\\\\?/)")}(?=(?:\\\\?/)wp-content(?:\\\\?/)uploads)`, "g")
  : null;

/** Rewrites absolute upload URLs in a raw JSON/text response body to relative ones. */
export function localizeMediaUrls(text: string): string {
  return pattern ? text.replace(pattern, "") : text;
}
