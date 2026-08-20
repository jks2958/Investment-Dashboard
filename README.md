# Portfolio Dashboard

A private, personal investment and finance dashboard: net worth, allocation,
holdings, cash, and income/expense tracking. Single-user, sidebar-driven app
modeled on a full dashboard UI reference.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, wouter
- Backend: Vercel Functions, Neon Postgres, Drizzle ORM
- Market data: Twelve Data (stocks/ETFs), CoinGecko (crypto), cached server-side
- Auth: single-user passphrase gate (DB-backed, changeable from Settings)
- Deployment: Vercel

## Run & Operate

- `npm run dev` — start the frontend dev server
- `npm run build` — typecheck + build for production
- `npm run typecheck` — typecheck only
- `npm run db:push` — push DB schema changes (dev only)
- `npm run db:generate` — generate SQL migrations

Required env (see `.env.example`):

- `DATABASE_URL` — Neon Postgres connection string
- `AUTH_PASSPHRASE` — seeds the passphrase on first run (stored hashed in the DB afterwards; change it from Settings)
- `AUTH_SESSION_SECRET` — session cookie signing secret
- `TWELVE_DATA_API_KEY` — stock/ETF price data (free tier: https://twelvedata.com)

CoinGecko needs no API key for crypto prices.

## First-time setup

1. Create a free Neon Postgres project, copy its connection string into `DATABASE_URL`.
2. Generate `AUTH_SESSION_SECRET` (e.g. `openssl rand -base64 32`) and pick an `AUTH_PASSPHRASE`.
3. Get a free Twelve Data API key for `TWELVE_DATA_API_KEY`.
4. `npm install && npm run db:push` to create the tables.
5. `npm run dev`, then enter your passphrase to unlock the dashboard.
6. For crypto holdings/wishlist items, use the CoinGecko coin id as the symbol (e.g. `bitcoin`, `ethereum`), not the ticker.

To deploy: import the repo into Vercel, set the same env vars there, and connect the same Neon database.

## Pages

- **Dashboard** — Total Assets hero card, Net Income/month, Expenses (with
  category breakdown), Wealth Distribution donut, and mini Cash/Stocks/Funds/
  Crypto cards with sparklines. Read-only overview.
- **Stocks Portfolio**, **Other Investments → Funds / Crypto** — holdings CRUD, filtered by type.
- **Income / Expense** — transaction log (income/expense with category), monthly summary.
- **Wishlist** — symbols you're watching, with an optional target price.
- **Account** — display name, cash accounts CRUD.
- **Settings** — theme (light/dark), change passphrase.

Sparklines and the "vs last month" deltas are driven by a daily
`net_worth_snapshots` table that self-records on each dashboard load — history
accumulates the more the app is used; there's no synthetic backfill.

## Where things live

- `src/pages` — top-level routes
- `src/components` — dashboard UI (cards, charts, lists, add/edit dialogs)
- `src/components/app-shell` — sidebar, header, mobile nav drawer
- `src/components/ui` — shadcn/ui primitives
- `src/hooks` — TanStack Query hooks (holdings, cash, transactions, wishlist, profile, snapshots)
- `src/lib` — auth context, theme, query client, API client, formatting, category icons
- `api/` — Vercel serverless functions (holdings, cash, transactions, wishlist, profile, snapshots, prices, auth)
- `lib/server` — session/auth helpers, market data fetchers, portfolio value math, zod validation
- `db/` — Drizzle schema, DB client, migrations

## Status

Fully implemented per the current design: passphrase auth (DB-backed,
changeable), holdings/cash/transactions/wishlist CRUD, cached market data,
and the full sidebar dashboard UI with historical sparklines.
