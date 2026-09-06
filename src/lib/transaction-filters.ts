import type { Transaction } from "@/lib/api";

export type TransactionFilter = {
  /** "YYYY-MM", or "all". */
  month: string;
  type: "all" | "income" | "expense";
  category: string;
  /** Matched against category and note. */
  query: string;
};

export const ALL_MONTHS = "all";
export const ALL_CATEGORIES = "all";

export const EMPTY_FILTER: TransactionFilter = {
  month: ALL_MONTHS,
  type: "all",
  category: ALL_CATEGORIES,
  query: "",
};

/** Months that actually have rows, newest first — offering an empty month in
 *  the picker is worse than not offering it. */
export function monthsPresent(rows: Transaction[]): string[] {
  const set = new Set(rows.map((t) => t.occurredOn.slice(0, 7)));
  return [...set].sort().reverse();
}

export function categoriesPresent(rows: Transaction[]): string[] {
  const set = new Set(rows.map((t) => t.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (!y || !m) return yyyyMm;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Filtering happens here rather than server-side on purpose: the widgets
 * already hold a 24-month window in the query cache, so reusing it makes the
 * filters instant and costs no extra requests. Only if this window stops being
 * enough does it become a server concern.
 */
export function applyFilter(rows: Transaction[], filter: TransactionFilter): Transaction[] {
  const q = filter.query.trim().toLowerCase();
  return rows.filter((t) => {
    if (filter.month !== ALL_MONTHS && t.occurredOn.slice(0, 7) !== filter.month) return false;
    if (filter.type !== "all" && t.type !== filter.type) return false;
    if (filter.category !== ALL_CATEGORIES && t.category !== filter.category) return false;
    if (q && !`${t.category} ${t.note ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function summarize(rows: Transaction[]): {
  income: number;
  expense: number;
  net: number;
} {
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = rows
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  return { income, expense, net: income - expense };
}
