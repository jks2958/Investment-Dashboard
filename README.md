# Portfolio Dashboard

A private, personal investment portfolio dashboard: net worth, allocation, and holdings at a glance. Single-user, tracking-only — no budgeting, no multi-user accounts, no trading.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, wouter
- Backend: Vercel Functions, Neon Postgres, Drizzle ORM
- Market data: Twelve Data (stocks/ETFs), CoinGecko (crypto), cached server-side
- Auth: single-user passphrase gate
- Deployment: Vercel

## Run & Operate

- `npm run dev` — start the frontend dev server
- `npm run build` — typecheck + build for production
- `npm run typecheck` — typecheck only
- `npx drizzle-kit push` — push DB schema changes (dev only)
- `npx drizzle-kit generate` — generate SQL migrations

Required env (see `.env.example`):

- `DATABASE_URL` — Neon Postgres connection string
- `AUTH_PASSPHRASE`, `AUTH_SESSION_SECRET` — single-user auth gate
- `TWELVE_DATA_API_KEY` — stock/ETF price data (free tier: https://twelvedata.com)

CoinGecko needs no API key for crypto prices.

## First-time setup

1. Create a free Neon Postgres project, copy its connection string into `DATABASE_URL`.
2. Generate `AUTH_SESSION_SECRET` (e.g. `openssl rand -base64 32`) and pick an `AUTH_PASSPHRASE`.
3. Get a free Twelve Data API key for `TWELVE_DATA_API_KEY`.
4. `npm install && npm run db:push` to create the tables.
5. `npm run dev`, then enter your passphrase to unlock the dashboard.
6. For crypto holdings, use the CoinGecko coin id as the symbol (e.g. `bitcoin`, `ethereum`), not the ticker.

To deploy: import the repo into Vercel, set the same env vars there, and connect the same Neon database.

## Where things live

- `src/pages` — top-level routes (Dashboard)
- `src/components` — dashboard UI (stat cards, allocation chart, holdings/cash lists, dialogs)
- `src/components/ui` — shadcn/ui primitives
- `src/hooks` — TanStack Query hooks for holdings/cash
- `src/lib` — auth context, theme, query client, API client, formatting
- `api/` — Vercel serverless functions (holdings, cash, prices, auth)
- `lib/server` — session/auth helpers, market data fetchers, zod validation
- `db/` — Drizzle schema, DB client, migrations

## Status

Core dashboard is implemented: passphrase auth, holdings/cash CRUD, cached
market data, and the Total Assets / Invested / Cash / Allocation view.
