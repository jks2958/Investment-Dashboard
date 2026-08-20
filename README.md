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
- `TWELVE_DATA_API_KEY` — stock/ETF price data

## Where things live

- `src/pages` — top-level routes (Dashboard, etc.)
- `src/components/ui` — shadcn/ui primitives
- `src/lib` — theme, query client, utilities
- `api/` — Vercel serverless functions (holdings, cash, prices, auth)
- `db/` — Drizzle schema, DB client, migrations

## Status

Project scaffold only — no dashboard functionality implemented yet.
