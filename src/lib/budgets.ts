import type { Budget, Transaction } from "@/lib/api";
import { isInMonthOffset } from "@/lib/date-range";

/** Where a category sits against its cap this month. */
export type BudgetStatus = {
  budget: Budget;
  limit: number;
  spent: number;
  remaining: number;
  /** Capped at 100 for the bar; `over` says whether it actually exceeded. */
  percent: number;
  over: boolean;
  /** Past this, it's worth mentioning before the month ends. */
  nearLimit: boolean;
};

/** Warn here rather than only at 100%, where saying so is too late to act on. */
const NEAR_LIMIT_PCT = 80;

export function budgetStatuses(
  budgets: Budget[] | undefined,
  transactions: Transaction[] | undefined,
  monthOffset = 0,
): BudgetStatus[] {
  const spendByCategory = new Map<string, number>();
  for (const t of transactions ?? []) {
    if (t.type !== "expense") continue;
    if (!isInMonthOffset(t.occurredOn, monthOffset)) continue;
    // Lower-cased so a cap still bites if an old row kept a stray spelling
    // that predates category folding.
    const key = t.category.trim().toLowerCase();
    spendByCategory.set(key, (spendByCategory.get(key) ?? 0) + Number(t.amount));
  }

  return (budgets ?? [])
    .map((budget) => {
      const limit = Number(budget.monthlyLimit);
      const spent = spendByCategory.get(budget.category.trim().toLowerCase()) ?? 0;
      const rawPercent = limit > 0 ? (spent / limit) * 100 : 0;
      return {
        budget,
        limit,
        spent,
        remaining: limit - spent,
        percent: Math.min(rawPercent, 100),
        over: spent > limit,
        nearLimit: rawPercent >= NEAR_LIMIT_PCT && spent <= limit,
      };
    })
    .sort((a, b) => b.spent / (b.limit || 1) - a.spent / (a.limit || 1));
}

export function budgetTotals(statuses: BudgetStatus[]): {
  limit: number;
  spent: number;
  overCount: number;
} {
  return {
    limit: statuses.reduce((sum, s) => sum + s.limit, 0),
    spent: statuses.reduce((sum, s) => sum + s.spent, 0),
    overCount: statuses.filter((s) => s.over).length,
  };
}
