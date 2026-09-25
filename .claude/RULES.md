# Site-wide Rules & Task Checklist

These rules apply to **every** task in this repo — bug fixes, new features, and refactors of old code alike. They supplement `AGENTS.md` (performance/design conventions, source of truth) — this file is the actionable checklist derived from it.

## 1. Speed is always the goal

Every task (old code touched, or new code added) must leave the site **as fast or faster** than before.

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

- [ ] **No duplicate requests per page.** Check every page for the same data fetched twice (layout + page, `generateMetadata` + page, several components). Dedupe with React `cache()` / a shared loader / the Next fetch cache.
- [ ] **Send only the fields you need, get back only the fields you need.** Trim GraphQL selections to what the UI renders. For WC/REST responses, strip `meta_data`, `_links`, and unused keys (use `_fields` or a lean serializer in the plugin). Never pass whole WC objects to the client.
- [ ] **Keep API calls per page to a minimum.** Prefer one combined query/endpoint per page over several small ones wherever it stays easy to maintain.
- [ ] For every task, list the requests the touched page makes (count, duplicates, payload size) and fix problems in the same change.

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
