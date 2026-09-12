<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design conventions

- **Minimum font size is 18px, site-wide, at every breakpoint — never smaller, on this page or any new section added later.** Enforced structurally in `src/app/globals.css`: Tailwind's `--text-xs`/`--text-sm`/`--text-base` theme tokens are floored at 18px (so any `text-xs`/`text-sm`/`text-base` class anywhere is automatically clamped), and `body` sets a matching 18px baseline for unstyled text. `text-lg` and above are already ≥18px and untouched. Do **not** use arbitrary-value classes like `text-[14px]` or `text-[10px]` to go under this floor — if a design genuinely needs a smaller number (e.g. a notification-count badge), flag it rather than silently violating the floor.
- **Every new section must be responsive across mobile and desktop**, not just styled for one viewport. For horizontally-scrolling carousels/sliders, follow the existing pattern in `CategorySlider.tsx`/`BestSellers.tsx`: card width as a `calc((100% - Nrem)/count)` arbitrary value per breakpoint (so a whole number of cards always fits with no partial cutoff), not a fixed pixel width.
- **Carousels/sliders** share `src/lib/utils/useInfiniteCarousel.ts` — a seamless, direction-aware, RTL-correct infinite-loop scroll hook (renders the item list repeated so the loop never hard-resets back to the start). Use it for any new horizontally-scrolling slider instead of writing bespoke scroll logic.

# Performance conventions

- **Page load speed is a first-class requirement for every page and section, not an afterthought to check later.** Apply these by default when building anything new — don't wait to be asked:
  - Fetch data in Server Components with `revalidate` + cache `tags` (see `src/lib/wpgraphql/products.ts`), never client-side `useEffect` fetch waterfalls for initial page content.
  - Give every route with async data a `loading.tsx` (Suspense boundary) so the shell paints instantly and only the data-dependent region shows a skeleton.
  - Never fetch the same per-item data (e.g. per-product custom fields) as N sequential/parallel requests in a list view — batch it or drop it from the list view entirely (see the `TAMAR_CUSTOM_FIELDS_ENABLED` comment in `products.ts` for a concrete case that cost 17s→60s on the homepage).
  - Any network call to the WordPress/WPGraphQL backend must go through `fetchGraphQL`/`fetchGraphQLSafe` in `src/lib/wpgraphql/client.ts`, which enforces a request timeout — a stalled or unreachable backend must fail fast into a graceful empty state, never hang the page indefinitely.
