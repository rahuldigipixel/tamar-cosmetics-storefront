# Tamar Cosmetics — Storefront

A headless Next.js storefront for Tamar Cosmetics, backed by a WordPress/WooCommerce site via WPGraphQL. RTL Hebrew UI, cart/checkout, wishlist, and product catalog.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4**
- **Zustand** for cart/wishlist client state
- **WPGraphQL** as the headless WooCommerce backend

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy the relevant env file and fill in the WPGraphQL endpoint and any auth/session secrets:

- `.env.local` — local development (gitignored)
- `.env.staging` — staging build (`npm run dev:staging` / `npm run build:staging`)
- `.env.production` — production build (`npm run build:production`)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run dev:staging` | Dev server with staging env vars |
| `npm run build` | Production build |
| `npm run build:staging` / `build:production` | Build with staging/production env vars |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  app/            # Routes (App Router): shop, product, cart, checkout, account, api/*
  components/     # UI components (layout, home, product, checkout)
  lib/
    wpgraphql/    # WPGraphQL client, queries/mutations, cart/session/product helpers
    store/        # Zustand stores (cart, wishlist)
    utils/
  types/          # Shared TypeScript types
```

Data is fetched from WordPress via WPGraphQL (`src/lib/wpgraphql`); API routes under `src/app/api/*` proxy cart/checkout/wishlist operations to the backend.
