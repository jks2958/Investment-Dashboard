import type { CardSkin } from "@/lib/card-skins";
import type { Currency } from "@/lib/format";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AssetType = "stock" | "fund" | "crypto";

/**
 * The currency an amount was entered in.
 *
 * Note the asymmetry, which is deliberate: on the way **in**, an amount is a
 * figure in `currency` — type 45000 with PKR and that's what's stored. On the
 * way **out**, every money field is USD, with the figure as typed repeated in
 * a `nativeX` field for the edit form. That keeps every total, chart and
 * snapshot in one unit without teaching each of them about exchange rates.
 */
export type EntryCurrency = "USD" | "PKR";

export type Holding = {
  id: number;
  symbol: string;
  assetType: AssetType;
  quantity: string;
  avgCostBasis: string;
  account: string | null;
  acquiredOn: string | null;
  lastPrice: string | null;
  priceFetchedAt: string | null;
};

export type HoldingInput = {
  symbol: string;
  assetType: AssetType;
  quantity: number;
  avgCostBasis: number;
  account?: string;
  acquiredOn?: string;
};

export type CashAccount = {
  currency: EntryCurrency;
  nativeBalance: string | null;
  id: number;
  name: string;
  balance: string;
  acquiredOn: string | null;
  createdAt: string;
};

export type CashInput = {
  currency?: EntryCurrency;
  name: string;
  balance: number;
  acquiredOn?: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  currency: EntryCurrency;
  nativeAmount: string | null;
  id: number;
  type: TransactionType;
  category: string;
  amount: string;
  occurredOn: string;
  note: string | null;
  createdAt: string;
};

export type TransactionInput = {
  currency?: EntryCurrency;
  type: TransactionType;
  category: string;
  amount: number;
  occurredOn: string;
  note?: string;
};

/** A monthly spending cap for one category. */
export type Budget = {
  id: number;
  category: string;
  monthlyLimit: string;
  nativeMonthlyLimit: string | null;
  currency: EntryCurrency;
  createdAt: string;
};

export type BudgetInput = {
  category: string;
  monthlyLimit: number;
  currency?: EntryCurrency;
};

export type Recurrence = "monthly" | "quarterly" | "yearly";

/** A template for an entry that repeats. Never auto-posted — dueDates are the
 *  occurrences waiting for you to confirm them. */
export type RecurringTransaction = {
  id: number;
  currency: EntryCurrency;
  nativeAmount: string | null;
  type: TransactionType;
  category: string;
  amount: string;
  recurrence: Recurrence;
  startsOn: string;
  endsOn: string | null;
  lastPostedOn: string | null;
  active: boolean;
  note: string | null;
  createdAt: string;
  dueDates: string[];
};

export type RecurringInput = {
  currency?: EntryCurrency;
  type: TransactionType;
  category: string;
  amount: number;
  recurrence?: Recurrence;
  startsOn: string;
  endsOn?: string;
  active?: boolean;
  note?: string;
};

export type WishlistItem = {
  id: number;
  symbol: string;
  assetType: AssetType;
  targetPrice: string | null;
  note: string | null;
  createdAt: string;
};

export type WishlistInput = {
  symbol: string;
  assetType: AssetType;
  targetPrice?: number;
  note?: string;
};

export type OtherAsset = {
  currency: EntryCurrency;
  nativeValue: string | null;
  id: number;
  name: string;
  value: string;
  acquiredOn: string | null;
  createdAt: string;
};

export type OtherAssetInput = {
  currency?: EntryCurrency;
  name: string;
  value: number;
  acquiredOn?: string;
};

export type WidgetType =
  | "total-assets"
  | "net-income"
  | "expenses"
  | "allocation"
  | "mini-cash"
  | "mini-stocks"
  | "mini-funds"
  | "mini-crypto"
  | "cash-accounts"
  | "other-assets"
  | "wishlist"
  | "transactions"
  | "holdings-stocks"
  | "holdings-funds"
  | "holdings-crypto"
  | "net-worth-trend"
  | "gainers-losers"
  | "cash-runway"
  | "wishlist-targets"
  | "allocation-drift"
  | "debts"
  | "debt-payoff"
  | "budgets"
  | "commitments";

export type WidgetLayoutItem = {
  i: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Accent = "forest" | "orange" | "blue" | "emerald" | "violet" | "rose";

/** Target portfolio mix, as percentages. All zeroes means "not configured". */
export type AllocationTargets = {
  stock: number;
  fund: number;
  crypto: number;
  cash: number;
  other: number;
};

export type DashboardSettings = {
  layoutLg: WidgetLayoutItem[];
  layoutMd: WidgetLayoutItem[];
  accent: Accent;
  cardSkin: CardSkin;
  targets: AllocationTargets;
  currency: Currency;
  /** Stored as a numeric string, like every other money column. */
  usdPkrRate: string;
};

export type DashboardSettingsUpdate = {
  layoutLg?: WidgetLayoutItem[];
  layoutMd?: WidgetLayoutItem[];
  accent?: Accent;
  cardSkin?: CardSkin;
  targets?: AllocationTargets;
  currency?: Currency;
  usdPkrRate?: number;
  refreshRate?: boolean;
  reset?: boolean;
};

export type CachedPrice = {
  symbol: string;
  assetType: AssetType | "cash";
  lastPrice: string;
  fetchedAt: string;
};

export type NetWorthSnapshot = {
  id: number;
  snapshotDate: string;
  cashValue: string;
  stockValue: string;
  fundValue: string;
  cryptoValue: string;
  otherValue: string;
  debtTotal: string;
  totalInvested: string;
};

/** One backfilled history row. */
export type SnapshotEntry = {
  snapshotDate: string;
  cashValue: number;
  stockValue: number;
  fundValue: number;
  cryptoValue: number;
  otherValue: number;
  debtTotal: number;
};

export type DebtKind =
  | "mortgage"
  | "car"
  | "credit_card"
  | "student"
  | "personal"
  | "business"
  | "other";

/** Money owed now — subtracts from net worth. */
export type Debt = {
  currency: EntryCurrency;
  nativeBalance: string | null;
  nativeOriginalAmount: string | null;
  nativeMonthlyPayment: string | null;
  id: number;
  name: string;
  kind: DebtKind;
  lender: string | null;
  balance: string;
  originalAmount: string | null;
  interestRate: string | null;
  monthlyPayment: string | null;
  startedOn: string | null;
  payoffTargetOn: string | null;
  note: string | null;
  createdAt: string;
};

export type DebtInput = {
  currency?: EntryCurrency;
  name: string;
  kind: DebtKind;
  lender?: string;
  balance: number;
  originalAmount?: number;
  interestRate?: number;
  monthlyPayment?: number;
  startedOn?: string;
  payoffTargetOn?: string;
  note?: string;
};

export type CommitmentCategory =
  | "education"
  | "family"
  | "purchase"
  | "medical"
  | "travel"
  | "other";

export type CommitmentCertainty = "confirmed" | "likely" | "possible";

/** A future cost you don't owe anyone yet — deliberately excluded from net worth. */
export type Commitment = {
  currency: EntryCurrency;
  nativeAmount: string | null;
  nativeFundedAmount: string | null;
  id: number;
  name: string;
  category: CommitmentCategory;
  amount: string;
  dueOn: string;
  recurringYears: number;
  certainty: CommitmentCertainty;
  fundedAmount: string;
  note: string | null;
  createdAt: string;
};

export type CommitmentInput = {
  currency?: EntryCurrency;
  name: string;
  category: CommitmentCategory;
  amount: number;
  dueOn: string;
  recurringYears?: number;
  certainty?: CommitmentCertainty;
  fundedAmount?: number;
  note?: string;
};

export const api = {
  session: () => request<{ authenticated: boolean }>("/api/auth/session"),
  login: (passphrase: string) =>
    request<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ passphrase }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  /** Invalidates every session, this device included. */
  revokeSessions: () => request<{ ok: true }>("/api/auth/revoke-sessions", { method: "POST" }),
  changePassphrase: (currentPassphrase: string, newPassphrase: string) =>
    request<{ ok: true }>("/api/auth/change-passphrase", {
      method: "POST",
      body: JSON.stringify({ currentPassphrase, newPassphrase }),
    }),

  holdings: {
    list: () => request<Holding[]>("/api/holdings"),
    create: (input: HoldingInput) =>
      request<Holding>("/api/holdings", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<HoldingInput>) =>
      request<Holding>(`/api/holdings/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/holdings/${id}`, { method: "DELETE" }),
  },

  cash: {
    list: () => request<CashAccount[]>("/api/cash"),
    create: (input: CashInput) =>
      request<CashAccount>("/api/cash", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<CashInput>) =>
      request<CashAccount>(`/api/cash/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/cash/${id}`, { method: "DELETE" }),
  },

  otherAssets: {
    list: () => request<OtherAsset[]>("/api/other-assets"),
    create: (input: OtherAssetInput) =>
      request<OtherAsset>("/api/other-assets", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<OtherAssetInput>) =>
      request<OtherAsset>(`/api/other-assets/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/other-assets/${id}`, { method: "DELETE" }),
  },

  transactions: {
    /** Defaults to the last 24 months server-side; pass more to widen it. */
    list: (months?: number) =>
      request<Transaction[]>(
        months === undefined ? "/api/transactions" : `/api/transactions?months=${months}`,
      ),
    create: (input: TransactionInput) =>
      request<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<TransactionInput>) =>
      request<Transaction>(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/transactions/${id}`, { method: "DELETE" }),
  },

  budgets: {
    list: () => request<Budget[]>("/api/budgets"),
    /** Upserts on category, so setting a cap twice edits rather than duplicates. */
    create: (input: BudgetInput) =>
      request<Budget>("/api/budgets", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<BudgetInput>) =>
      request<Budget>(`/api/budgets/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/budgets/${id}`, { method: "DELETE" }),
  },

  categories: {
    list: () => request<{ category: string; count: number }[]>("/api/categories"),
    /** Repoints every row on `from` onto `into`. */
    merge: (from: string, into: string) =>
      request<{ moved: number }>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ from, into }),
      }),
  },

  recurring: {
    list: () => request<RecurringTransaction[]>("/api/recurring"),
    create: (input: RecurringInput) =>
      request<RecurringTransaction>("/api/recurring", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: number, input: Partial<RecurringInput>) =>
      request<RecurringTransaction>(`/api/recurring/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    remove: (id: number) => request<void>(`/api/recurring/${id}`, { method: "DELETE" }),
    /** Writes the outstanding occurrences into the transaction log. */
    post: (id: number) =>
      request<{ posted: number }>(`/api/recurring/${id}?action=post`, { method: "POST" }),
  },

  wishlist: {
    list: () => request<WishlistItem[]>("/api/wishlist"),
    create: (input: WishlistInput) =>
      request<WishlistItem>("/api/wishlist", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<WishlistInput>) =>
      request<WishlistItem>(`/api/wishlist/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/wishlist/${id}`, { method: "DELETE" }),
  },

  profile: {
    get: () => request<{ name: string }>("/api/profile"),
    update: (name: string) =>
      request<{ name: string }>("/api/profile", { method: "PATCH", body: JSON.stringify({ name }) }),
  },

  snapshots: {
    list: (days?: number) =>
      request<NetWorthSnapshot[]>(
        days === undefined ? "/api/snapshots" : `/api/snapshots?days=${days}`,
      ),
    listAll: () => request<NetWorthSnapshot[]>("/api/snapshots?all=1"),
    /** Backfill. Always an array so one row and a bulk paste share a path. */
    save: (entries: SnapshotEntry[]) =>
      request<{ ok: true; count: number }>("/api/snapshots", {
        method: "POST",
        body: JSON.stringify(entries),
      }),
    remove: (date: string) =>
      request<void>(`/api/snapshots/${date}`, { method: "DELETE" }),
  },

  prices: {
    list: () => request<CachedPrice[]>("/api/prices"),
  },

  debts: {
    list: () => request<Debt[]>("/api/debts"),
    create: (input: DebtInput) =>
      request<Debt>("/api/debts", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<DebtInput>) =>
      request<Debt>(`/api/debts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/debts/${id}`, { method: "DELETE" }),
  },

  commitments: {
    list: () => request<Commitment[]>("/api/commitments"),
    create: (input: CommitmentInput) =>
      request<Commitment>("/api/commitments", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: Partial<CommitmentInput>) =>
      request<Commitment>(`/api/commitments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    remove: (id: number) => request<void>(`/api/commitments/${id}`, { method: "DELETE" }),
  },

  dashboardSettings: {
    get: () => request<DashboardSettings>("/api/dashboard-settings"),
    update: (input: DashboardSettingsUpdate) =>
      request<DashboardSettings>("/api/dashboard-settings", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
  },
};
