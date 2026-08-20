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
  lastPrice: string | null;
  priceFetchedAt: string | null;
};

export type HoldingInput = {
  symbol: string;
  assetType: AssetType;
  quantity: number;
  avgCostBasis: number;
  account?: string;
};

export type CashAccount = {
  id: number;
  name: string;
  balance: string;
  createdAt: string;
};

export type CashInput = {
  name: string;
  balance: number;
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

export type NetWorthSnapshot = {
  id: number;
  snapshotDate: string;
  cashValue: string;
  stockValue: string;
  fundValue: string;
  cryptoValue: string;
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
    list: () => request<NetWorthSnapshot[]>("/api/snapshots"),
  },
};
