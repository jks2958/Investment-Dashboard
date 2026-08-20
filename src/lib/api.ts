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

export const api = {
  session: () => request<{ authenticated: boolean }>("/api/auth/session"),
  login: (passphrase: string) =>
    request<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ passphrase }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

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
};
