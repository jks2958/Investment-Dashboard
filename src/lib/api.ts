import type { CardSkin } from "@/lib/card-skins";

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
  id: number;
  name: string;
  balance: string;
  acquiredOn: string | null;
  createdAt: string;
};

export type CashInput = {
  name: string;
  balance: number;
  acquiredOn?: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  type: TransactionType;
  category: string;
  amount: string;
  occurredOn: string;
  note: string | null;
  createdAt: string;
};

export type TransactionInput = {
  type: TransactionType;
  category: string;
  amount: number;
  occurredOn: string;
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
  id: number;
  name: string;
  value: string;
  acquiredOn: string | null;
  createdAt: string;
};

export type OtherAssetInput = {
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
  | "allocation-drift";

export type WidgetLayoutItem = {
  i: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Accent = "orange" | "blue" | "emerald" | "violet" | "rose";

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
};

export type DashboardSettingsUpdate = {
  layoutLg?: WidgetLayoutItem[];
  layoutMd?: WidgetLayoutItem[];
  accent?: Accent;
  cardSkin?: CardSkin;
  targets?: AllocationTargets;
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
  totalInvested: string;
};

export const api = {
  session: () => request<{ authenticated: boolean }>("/api/auth/session"),
  login: (passphrase: string) =>
    request<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ passphrase }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  changePassphrase: (currentPassphrase: string, newPassphrase: string) =>
    request<{ ok: true }>("/api/auth/change-passphrase", {
      method: "POST",
      body: JSON.stringify({ currentPassphrase, newPassphrase }),
    }),

  holdings: {
    list: () => request<Holding[]>("/api/holdings"),
    create: (input: HoldingInput) =>
      request<Holding>("/api/holdings", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/holdings/${id}`, { method: "DELETE" }),
  },

  cash: {
    list: () => request<CashAccount[]>("/api/cash"),
    create: (input: CashInput) =>
      request<CashAccount>("/api/cash", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/cash/${id}`, { method: "DELETE" }),
  },

  otherAssets: {
    list: () => request<OtherAsset[]>("/api/other-assets"),
    create: (input: OtherAssetInput) =>
      request<OtherAsset>("/api/other-assets", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/other-assets/${id}`, { method: "DELETE" }),
  },

  transactions: {
    list: () => request<Transaction[]>("/api/transactions"),
    create: (input: TransactionInput) =>
      request<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: number) => request<void>(`/api/transactions/${id}`, { method: "DELETE" }),
  },

  wishlist: {
    list: () => request<WishlistItem[]>("/api/wishlist"),
    create: (input: WishlistInput) =>
      request<WishlistItem>("/api/wishlist", { method: "POST", body: JSON.stringify(input) }),
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
  },

  prices: {
    list: () => request<CachedPrice[]>("/api/prices"),
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
