# Portfolio Dashboard

A private, personal investment and finance dashboard: net worth, allocation,
holdings, cash, and income/expense tracking. Single-user, sidebar-driven app
modeled on a full dashboard UI reference.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, wouter
- Backend: Vercel Functions, Neon Postgres, Drizzle ORM
- Market data: Finnhub (stocks/ETFs), CoinGecko (crypto), cached server-side
- Auth: single-user passphrase gate (DB-backed, changeable from Settings)
- Deployment: Vercel

## Run & Operate

- `npm run dev` — start the frontend dev server (UI only — does **not** serve
  `/api`; use this for pure UI iteration, not for testing auth or data)
- `vercel dev` — full local stack, frontend + `/api` functions together
  (requires the Vercel CLI and `vercel link` against your project; needed to
  actually exercise login, holdings, prices, etc. locally)
- `npm run build` — typecheck + build for production
- `npm run typecheck` — typecheck only
- `npm run db:migrate` — apply committed SQL migrations to the DB (idempotent;
  this also runs automatically on every Vercel deploy, via `vercel.json`'s
  build command — no manual step needed once `DATABASE_URL` is set there)
- `npm run db:push` — dev-only shortcut: push schema changes straight to the
  DB without generating migration files (handy for local iteration only)
- `npm run db:generate` — generate SQL migration files from schema changes

Required env (see `.env.example`):

- `DATABASE_URL` — Neon Postgres connection string
- `AUTH_PASSPHRASE` — seeds the passphrase on first run (stored hashed in the DB afterwards; change it from Settings)
- `AUTH_SESSION_SECRET` — session cookie signing secret
- `FINNHUB_API_KEY` — stock/ETF price data (free tier, no credit card required: https://finnhub.io)

CoinGecko needs no API key for crypto prices.

## First-time setup

1. Create a free Neon Postgres project, copy its connection string into `DATABASE_URL`.
2. Generate `AUTH_SESSION_SECRET` (e.g. `openssl rand -base64 32`) and pick an `AUTH_PASSPHRASE`.
3. Get a free Finnhub API key for `FINNHUB_API_KEY` (sign up with just an email, no card).
4. Deploying to Vercel with those 4 env vars set is enough — the DB tables
   are created automatically on deploy (see `db:migrate` above). Working
   locally instead? Run `npm install && npm run db:migrate`.
5. `vercel dev` (not `npm run dev` — see above), then enter your passphrase to unlock the dashboard.
6. For crypto holdings/wishlist items, use the CoinGecko coin id as the symbol (e.g. `bitcoin`, `ethereum`), not the ticker.

To deploy: import the repo into Vercel, set the same env vars there, and connect the same Neon database — the schema is created automatically on the first deploy.

## Pages

- **Dashboard** — a fully customizable widget grid (see below). Default
  widgets: Total Assets hero card, Net Income/month, Expenses (with category
  breakdown), Wealth Distribution donut, and mini Cash/Stocks/Funds/Crypto
  cards with sparklines.
- **Stocks Portfolio**, **Other Investments → Funds / Crypto** — holdings CRUD, filtered by type.
- **Income / Expense** — transaction log (income/expense with category), monthly summary.
- **Wishlist** — symbols you're watching, with an optional target price.
- **Account** — display name, cash accounts CRUD, other assets CRUD.
- **Settings** — theme (light/dark), accent color preset, change passphrase.

## Customizable dashboard

Click **Customize** on the Dashboard to enter edit mode (desktop and tablet
only — mobile stays a fixed single-column view, since drag/resize doesn't
translate to touch-sized screens):

- **Drag** any widget by its grip handle to reposition it.
- **Resize** by dragging its bottom-right corner.
- **Add widget** opens a palette of all available widget types (stat cards,
  charts, list previews, per-type holdings lists) — add as many as you like,
  duplicates included.
- **Remove** a widget with its × button.
- **Reset to default** restores the original layout.

Layout is stored per breakpoint (desktop/tablet) in the `dashboard_settings`
table and applies across devices. Widget types live in
`src/lib/widget-registry.tsx` — add an entry there (plus a self-contained
component under `src/widgets/`) to make a new widget available in the palette.

Sparklines and the "vs last month" deltas are driven by a daily
`net_worth_snapshots` table that self-records on each dashboard load — history
accumulates the more the app is used; there's no synthetic backfill.

## Where things live

- `src/pages` — top-level routes
- `src/components` — dashboard UI (cards, charts, lists, add/edit dialogs, the widget grid)
- `src/components/app-shell` — sidebar, header, mobile nav drawer
- `src/components/ui` — shadcn/ui primitives
- `src/widgets` — self-contained dashboard widget components (each fetches its own data)
- `src/lib/widget-registry.tsx` — widget type → component/default-size registry
- `src/hooks` — TanStack Query hooks (holdings, cash, other assets, transactions, wishlist, profile, snapshots, dashboard settings)
- `src/lib` — auth context, theme, query client, API client, formatting, category icons
- `api/` — Vercel serverless functions (holdings, cash, other-assets, transactions, wishlist, profile, snapshots, prices, dashboard-settings, auth)
- `lib/server` — session/auth helpers, market data fetchers, portfolio value math, zod validation
- `db/` — Drizzle schema, DB client, migrations

## Status

Fully implemented per the current design: passphrase auth (DB-backed,
changeable), holdings/cash/other-assets/transactions/wishlist CRUD, cached
market data, a customizable widget-grid dashboard, accent theming, and
historical sparklines.
