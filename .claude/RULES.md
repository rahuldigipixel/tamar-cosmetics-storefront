# Site-wide Rules & Task Checklist

These rules apply to **every** task in this repo — bug fixes, new features, and refactors of old code alike. They supplement `AGENTS.md` (performance/design conventions, source of truth) — this file is the actionable checklist derived from it.

## 1. Speed is always the goal

Every task (old code touched, or new code added) must leave the site **as fast or faster** than before.

- [ ] **Hard budget: every page must load in 0-2 seconds, full stop — not "usually fast," a hard ceiling for current and every future task.** "Load" means time-to-first-byte through the page being usable (main content painted, not spinner-only) on a normal connection against the real backend, not a warm cache. This is not a check to run once at the end — write every piece of code (new page, new section, new API call, new component) with this budget already in mind, the same way the 2-call API cap and the 18px font floor are applied by default, not bolted on after. Concretely:
  - Default to the patterns already in this file (Server Components + `revalidate`/tags, `loading.tsx` Suspense boundaries, the 2-call-per-page API budget, batched queries) — those exist specifically to hit this ceiling.
  - Before marking any task done (see section 3), actually load the touched page(s) and check real timing — the `[api-call]` console log plus the Next.js dev server's own `GET ... 200 in Nms` line (see `apiAuditLog.ts`) gives call count and server-side render time for free; check the browser's Network tab / Lighthouse for full page-load time, not just the server-side portion.
  - If a page is measured over 2s, that's a bug to fix in the same change — profile which part is slow (backend query, uncompressed payload, missing cache, waterfall, unoptimized image, oversized client bundle) and fix the actual cause, not just the symptom on that one page.
  - A new feature that would push a page past 2s (e.g. a heavy widget, a large uncached third-party call) needs to be streamed in via `Suspense` / deferred / lazy-loaded so it doesn't block the 0-2s budget for the rest of the page, rather than skipped or shipped slow.
- [ ] Server Components + `revalidate`/cache `tags` for initial data (see `src/lib/wpgraphql/products.ts`) — never a client `useEffect` fetch waterfall for first paint.
- [ ] Every route with async data has a `loading.tsx` Suspense boundary so the shell paints instantly.
- [ ] Never issue N sequential/parallel per-item requests in a list view — batch or drop the field.
- [ ] All WordPress/WPGraphQL calls go through `fetchGraphQL`/`fetchGraphQLSafe` in `src/lib/wpgraphql/client.ts` (enforces timeout, fails fast to empty state).
- [ ] No new client-side dependency/library added without checking bundle-size impact.
- [ ] Images use `next/image` (or equivalent optimized path), not raw `<img>` for site content.
- [ ] When editing an existing slow area, fix the perf issue in the same change rather than leaving a TODO.
- [ ] Any client component with more than one async source feeding a single "loading" UI (e.g. a Zustand/persisted store hydrating from `localStorage` + a follow-up `fetch` for details) must derive `loading` from real completion state (e.g. compare a "loaded for these ids/keys" marker against the current ids/keys), not from a `boolean` flipped early by just one of the sources. Flipping it early renders a false empty/error state for a frame before the real data lands — seen on `/wishlist` (Sept 2026: page flashed "list is empty" between the store's `fetchWishlist()` resolving and the per-product `fetch` calls actually finishing). Check this on every new page/component that combines a persisted store with a follow-up data fetch.

### API requests (backend = WP plugin `tamar-headless-api`)

The backend API is the custom WordPress plugin at `\\192.168.0.107\eds-www\tamarcosmetics_react\wp-content\plugins\tamar-headless-api`. When a lean response or batch endpoint is needed, change it there rather than working around it in React.

- [ ] **Hard cap: no more than 2-3 API calls total per page load.** Split: (1) header/menu/footer/global site data — one shared call, fetched once and reused across pages, never refetched per page. (2) page-specific content (page data, WooCommerce products/categories) — one call that returns everything that page needs. A 3rd call is the max allowed exception, not the default budget.
- [ ] **No duplicate requests per page.** Check every page for the same data fetched twice (layout + page, `generateMetadata` + page, several components). Dedupe with React `cache()` / a shared loader / the Next fetch cache.
- [ ] **Send only the fields you need, get back only the fields you need.** Trim GraphQL selections to what the UI renders — products, categories, and images included. For WC/REST responses, strip `meta_data`, `_links`, and unused/extra/dummy keys (use `_fields` or a lean serializer in the plugin). Never pass whole WC objects to the client.
- [ ] **Keep API calls per page to a minimum.** Prefer one combined query/endpoint per page over several small ones wherever it stays easy to maintain.
- [ ] **Compress responses:** gzip at minimum, prefer **Brotli (br)** over gzip wherever the backend/server supports it — smaller payloads for JSON/text than gzip.
- [ ] **Edge/HTTP caching:** set `Cache-Control` and use Next's `revalidate`/cache `tags` so repeat requests are served from cache/edge instead of hitting the WP backend again.
- [ ] For every task, list the requests the touched page makes (count vs. the 2-3 call cap, duplicates, payload size, compression/cache headers) and fix problems in the same change.
- [ ] **Every page now consistently makes exactly 2 backend calls: 1 `REST /global-data` (shared header/menu/footer) + 1 combined page-content call.** Confirmed 2026-09-28 for `/`, `/product-category/:slug`, `/product/:slug`, `/brand-list`. Also confirmed 2026-09-29 for `/wholesale`, `/secret-club`, `/reviews` (each: 1 `global-data` from the root layout + 1 own `REST /wholesale-page` / `/secret-club-page` / `/reviews-page`, all React `cache()`-wrapped so `generateMetadata` + the page body share the same single request). `/reviews` additionally loads `FlashyReviewsWidget`, a client-side third-party script (Flashy's `thunder.js`) — that's outside this backend-call budget entirely (no `tamarFetch`/`fetchGraphQL` call of ours), same as any other embedded widget. When a page needs data that isn't natively combinable via WPGraphQL aliasing (e.g. a custom plugin REST field), add it to WPGraphQL instead of firing a second request — see `tamarCategoryInfo` in the plugin's `class-wc-product-module.php` for the pattern (`register_graphql_object_type` + `register_graphql_field('RootQuery', ...)`, mirroring the existing `PaBrand` custom fields in `class-wc-product-extra-taxonomy.php`). Keep it that way — a new page/feature that pushes a page past 2 calls needs justifying or folding in, not left as-is.
- [ ] **Every backend call logs itself to the server console in dev**, via `logApiCall()` in `src/lib/wpgraphql/apiAuditLog.ts` (called from `fetchGraphQL` in `client.ts` and `tamarFetch` in `tamarApi.ts`). Output looks like `[api-call] GraphQL GetHomeData` / `[api-call] REST /global-data`. Silent in production (`NODE_ENV === "production"` check inside `logApiCall`). Any new WPGraphQL/REST fetch helper must go through `fetchGraphQL`/`fetchGraphQLSafe`/`tamarFetch` (already required above) so it's covered automatically — don't call `fetch()` directly for backend data. To verify a page's call count: load it in the browser and read the `[api-call]` lines in the `next dev` terminal for that request.

## 2. New sections must match the current theme/design

- [ ] Reuse existing design tokens/colors (light theme, brand-soft/accent — see memory: avoid dark/black section backgrounds).
- [ ] New primary CTA buttons use the gradient + hover-lift style from `AddToCartButton`, not a flat color.
- [ ] Minimum font size 18px site-wide — no `text-[Npx]` arbitrary values under the floor (see `AGENTS.md`).
- [ ] Responsive at mobile + desktop for every new section, not styled for one viewport only.
- [ ] New horizontally-scrolling carousels/sliders use `src/lib/utils/useInfiniteCarousel.ts` and the `calc((100% - Nrem)/count)` card-width pattern from `CategorySlider.tsx`/`BestSellers.tsx` — no bespoke scroll logic.

## 3. Before marking any task done

- [ ] `npm run lint` passes.
- [ ] `npm run build` succeeds (catches type errors + confirms no perf-breaking regressions in build output).
- [ ] For UI changes: verified in the browser at mobile + desktop widths, not just type-checked.
- [ ] No secrets/`.env*` values read into code, commits, or output (see `.claude/settings.json` deny rules).

## 4. Repo hygiene (git)

- [ ] Never commit `.env*`, `node_modules/`, `.next/`, `.vercel/`, `*.tsbuildinfo`, or local IDE/editor folders (see `.gitignore`).
- [ ] Before `git add`, run `git status` and review the file list for anything that shouldn't be staged (secrets, build artifacts, large binaries).
- [ ] Never edit `.claude/settings.local.json` into the repo (already git-ignored) — personal permission overrides stay local.
