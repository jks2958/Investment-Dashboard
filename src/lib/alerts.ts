import type { Budget, Commitment, Holding, Transaction, WishlistItem } from "@/lib/api";
import { budgetStatuses } from "@/lib/budgets";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { commitmentMath } from "@/lib/liabilities";
import { priceAge } from "@/lib/price-freshness";

export type Alert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "positive" | "warning" | "neutral";
};

/** A commitment this far out is close enough to be worth a nudge. */
const DUE_SOON_DAYS = 90;

/**
 * The things worth interrupting you about, derived from data already loaded.
 *
 * Deliberately narrow: only states that are both actionable and time-sensitive.
 * A bell that cries wolf gets ignored, and this one has no way to be dismissed
 * per-item — each alert clears when the underlying situation does.
 */
export function buildAlerts({
  wishlist,
  prices,
  commitments,
  holdings,
  budgets,
  transactions,
}: {
  wishlist: WishlistItem[];
  prices: { symbol: string; lastPrice: string }[];
  commitments: Commitment[];
  holdings: Holding[];
  budgets?: Budget[];
  transactions?: Transaction[];
}): Alert[] {
  const alerts: Alert[] = [];

  // Over budget is worth saying; 80% is worth saying *earlier*, while there's
  // still a month left to act on it.
  for (const status of budgetStatuses(budgets, transactions)) {
    if (status.over) {
      alerts.push({
        id: `budget-${status.budget.id}`,
        title: `${status.budget.category} is over budget`,
        detail: `${formatCurrency(-status.remaining)} past the ${formatCurrency(
          status.limit,
        )} cap`,
        href: "/income-expense",
        tone: "warning",
      });
    } else if (status.nearLimit) {
      alerts.push({
        id: `budget-${status.budget.id}`,
        title: `${status.budget.category} is close to its cap`,
        detail: `${formatCurrency(status.remaining)} left of ${formatCurrency(status.limit)}`,
        href: "/income-expense",
        tone: "warning",
      });
    }
  }
  const priceBySymbol = new Map(prices.map((p) => [p.symbol, Number(p.lastPrice)]));

  // A wishlist target is a buy price, so the market coming *down* to it is
  // the good news.
  for (const item of wishlist) {
    if (item.targetPrice === null) continue;
    const price = priceBySymbol.get(item.symbol);
    if (price === undefined) continue;
    if (price <= Number(item.targetPrice)) {
      alerts.push({
        id: `wishlist-${item.id}`,
        title: `${item.symbol.toUpperCase()} hit your target`,
        detail: `Now ${formatCurrency(price)}, target ${formatCurrency(Number(item.targetPrice))}`,
        href: "/wishlist",
        tone: "positive",
      });
    }
  }

  for (const commitment of commitments) {
    const math = commitmentMath(commitment);
    if (math.remaining <= 0) continue;
    if (math.isOverdue) {
      alerts.push({
        id: `commitment-${commitment.id}`,
        title: `${commitment.name} is overdue`,
        detail: `${formatCurrency(math.remaining)} still to find`,
        href: "/liabilities",
        tone: "warning",
      });
    } else if (math.monthsUntilDue * 30 <= DUE_SOON_DAYS) {
      alerts.push({
        id: `commitment-${commitment.id}`,
        title: `${commitment.name} is due soon`,
        detail: `Due ${formatDateShort(commitment.dueOn)}, ${formatCurrency(
          math.remaining,
        )} short`,
        href: "/liabilities",
        tone: "warning",
      });
    }
  }

  // One stale price makes every total on the dashboard wrong, so it's one
  // alert for the lot rather than one per symbol.
  const stale = holdings.filter((h) => h.lastPrice !== null && priceAge(h.priceFetchedAt)?.stale);
  if (stale.length > 0) {
    alerts.push({
      id: "stale-prices",
      title: `${stale.length} price${stale.length === 1 ? "" : "s"} out of date`,
      detail: "Market data hasn't refreshed — check your API key",
      href: "/stocks",
      tone: "warning",
    });
  }

  const unpriced = holdings.filter((h) => h.lastPrice === null);
  if (unpriced.length > 0) {
    alerts.push({
      id: "unpriced",
      title: `${unpriced.length} holding${unpriced.length === 1 ? "" : "s"} unpriced`,
      detail: unpriced.map((h) => h.symbol.toUpperCase()).slice(0, 4).join(", "),
      href: "/stocks",
      tone: "warning",
    });
  }

  return alerts;
}
