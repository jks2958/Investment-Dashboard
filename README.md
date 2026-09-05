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
- **Liabilities & Commitments** — two tabs, deliberately separate (see below).
- **Wishlist** — symbols you're watching, with an optional target price.
- **Account** — display name, cash accounts CRUD, other assets CRUD.

Holdings, cash accounts and other assets each take a date (purchase date /
opened on / acquired on), pre-filled with today but freely backdated, so assets
can be entered retrospectively. Holdings show how long they've been held. The
date is a record of when you acquired something — it does not rewrite past
`net_worth_snapshots`, which only accumulate from the day you start using the
app.

## Editing and deleting

Every record type — holdings, cash accounts, other assets, transactions,
wishlist items, debts, commitments — can be **edited** from its row (the pencil
button) as well as added and deleted. One component serves both jobs: pass
`editing` and the form fills from that record and PATCHes it, omit it and the
same form POSTs a new one. `FormDialog` in `src/components/form-dialog.tsx`
carries the shared chrome and the open-state contract that lets a dialog either
own its own "Add" button or be opened by a row (or the command palette).

**Deletes always confirm**, via `DeleteButton`. There is no undo behind them,
and on a tablet the trash icon sits a thumb's width from the row's value — so
the confirmation names the record and what's lost with it rather than asking
"are you sure?".

## Header

The search box opens a **command palette** (`⌘K` / `Ctrl-K`): it searches your
own holdings, wishlist and accounts, jumps to any page, and starts an entry via
the same dialogs the pages use. The **bell** shows real alerts derived from data
already loaded — a wishlist target reached, a commitment due within 90 days and
underfunded, prices that have gone stale, holdings the provider couldn't price —
so opening it costs no extra requests. Nothing is dismissable per-item: each
alert clears when the situation does.

## Loading, empty and stale states

Lists and widgets show **skeletons** shaped like their content rather than a
"Loading…" line, so the grid doesn't jump as queries land one at a time (Neon
cold starts make that window visible).

**Empty states** carry a reason and their own primary action, because the "Add"
button in a card header reads as chrome rather than as the answer to an empty
list. A brand-new database also gets a **setup checklist** on the dashboard —
cash → holdings → transactions, the order that makes the rest of the app light
up — which hides itself once all three are done. Dismissing it early is stored
in `localStorage`, deliberately not in `dashboard_settings`: it's a nudge, not a
preference worth a round-trip.

Market prices are cached server-side and refreshed when older than 15 minutes,
so a price much older than that means a lookup is failing quietly. The Total
Assets card carries an always-on "prices <age>" line for the portfolio as a
whole (the oldest price in it, since one stale row makes the total wrong), and
individual holding rows call it out only when stale — a fresh "5m ago" on every
row is noise.

## Currency

Every amount is **stored in USD** — market data arrives in USD and keeping one
storage currency avoids re-denominating history whenever a rate moves. The
`currency` setting only affects display, converting at the stored
`usd_pkr_rate`. The Total Assets card always shows both, with the inactive
currency underneath as the equivalent.

The rate is editable by hand and can be refreshed from open.er-api.com (free,
no key) via **Settings → Currency → Fetch latest**. A failed lookup leaves the
stored rate alone rather than erroring, so a flaky FX API can never block the
setting or blank out the dashboard.

`formatCurrency` reads a module-level config rather than taking the currency as
an argument, which keeps its signature intact across ~80 call sites. Since that
alone re-renders nothing, `CurrencyBridge` in `App.tsx` keys the app subtree on
the currency and rate so a change remounts it — the query cache lives outside
the remount, so nothing is refetched.

## Debts vs. commitments

These are two different things and the app keeps them apart on purpose:

- **Debts** are money owed *now*, to someone specific — mortgage, car loan,
  credit card. They **subtract from net worth**, so the sidebar figure is
  assets minus debts, and snapshots record a `debt_total` so the Net Worth
  Trend chart stays honest historically.
- **Commitments** are money you'll need *later* but don't owe anyone yet —
  tuition, a wedding, a car replacement. They **never touch net worth**;
  subtracting a 2032 school fee from today's balance sheet would be meaningless
  (it ignores eight years of income first). Instead each one computes the
  monthly saving needed to be ready in time, and the total is compared against
  what you're actually saving.

Commitments carry a certainty (confirmed / likely / possible) so a firm date
and a vague maybe don't count equally, and a `recurringYears` so four years of
tuition is one row rather than four.

Note that ongoing family support is a *recurring expense*, not a commitment —
commitments are dated, finite costs.
- **Settings** — theme (light/dark), accent color preset, Total Assets card
  skin, display currency and USD→PKR rate, target allocation (the mix the
  Allocation Drift widget compares against), change passphrase.

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

Available widgets, beyond the defaults listed above:

- **Net Worth Trend** — net worth charted over 30 days / 90 days / 6 months /
  1 year, opening on 6 months.
- **Gainers & Losers** — unrealized P/L per holding (market value vs. cost
  basis), best and worst ranked, with a portfolio-wide total.
- **Cash Runway** — how many months of expenses your cash covers, against the
  trailing 3 complete months of spending.
- **Wishlist Targets** — how far each watched symbol is from its target buy
  price, closest first.
- **Allocation Drift** — actual vs. target mix per asset type, with the amount
  to add or trim to get back on target. Set targets in Settings.
- **Debts** — total owed, share of assets, largest balances, and the
  highest-rate debt to attack first.
- **Future Commitments** — what to set aside monthly, measured against what
  you're actually saving.
- Cash Accounts, Other Assets, Wishlist, Recent Transactions, and per-type
  holdings lists (stocks / funds / crypto).

Layout is stored per breakpoint (desktop/tablet) in the `dashboard_settings`
table and applies across devices. Widget types live in
`src/lib/widget-registry.tsx` — add an entry there (plus a self-contained
component under `src/widgets/`) to make a new widget available in the palette.
A new type also needs adding to `WidgetType` in `src/lib/api.ts` and
`widgetTypeSchema` in `lib/server/validation.ts`, which are mirrored by hand.

Sparklines, the percentage deltas beside them and the Net Worth Trend chart are
driven by a daily `net_worth_snapshots` table that self-records on each
dashboard load. They all look back over the same window — 6 months, set once as
`TREND_WINDOW_DAYS` in `src/lib/date-range.ts` alongside the label that
describes it, so a figure and its caption can't drift apart. The trend chart
opens there too but can be switched per-view without affecting the sparklines,
which read a separate query key.

The "vs last month" comparisons on the Net Income and Expenses cards are a
different thing — calendar month against calendar month, computed from
transactions rather than snapshots — and are deliberately left as they are.

History can also be entered by hand, under **Account → Net worth history** —
either one date at a time or by pasting rows (`date, cash, stocks, funds,
crypto, other, debt`; a header row is ignored and commas or tabs both work, so
a spreadsheet copy-paste goes straight in). Backfilled figures are your own
recorded numbers rather than a reconstruction, which matters because there's no
historical price data to value past holdings with.

Backfill is limited to dates before today: today's row is recomputed from live
holdings on every dashboard load, so a hand-typed value for it would just be
overwritten. Past rows are never touched by the daily write.

## Where things live

- `src/pages` — top-level routes
- `src/components` — dashboard UI (cards, charts, lists, add/edit dialogs, the widget grid)
- `src/components/app-shell` — sidebar, header, mobile nav drawer
- `src/components/ui` — shadcn/ui primitives
- `src/widgets` — self-contained dashboard widget components (each fetches its own data)
- `src/lib/widget-registry.tsx` — widget type → component/default-size registry
- `src/hooks` — TanStack Query hooks (holdings, cash, other assets, transactions, wishlist, profile, snapshots, dashboard settings)
- `src/lib` — auth context, theme, query client, API client, formatting, category icons, price freshness, alert derivation
- `api/` — Vercel serverless functions (holdings, cash, other-assets, transactions, wishlist, profile, snapshots, prices, dashboard-settings, auth)
- `lib/server` — session/auth helpers, market data fetchers, portfolio value math, zod validation
- `db/` — Drizzle schema, DB client, migrations

## Status

Fully implemented per the current design: passphrase auth (DB-backed,
changeable), holdings/cash/other-assets/transactions/wishlist CRUD, cached
market data, a customizable widget-grid dashboard, accent theming, and
historical sparklines.
