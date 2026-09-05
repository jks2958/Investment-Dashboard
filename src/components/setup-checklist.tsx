import * as React from "react";
import { Link } from "wouter";
import { Check, X } from "lucide-react";

import { CashDialog } from "@/components/cash-dialog";
import { HoldingDialog } from "@/components/holding-dialog";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCashAccounts } from "@/hooks/use-cash";
import { useHoldings } from "@/hooks/use-holdings";
import { useTransactions } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "setup-checklist-dismissed";

/**
 * What a brand-new dashboard shows instead of a grid of zeroes.
 *
 * Every widget reads from the same three tables, so an empty database renders
 * a page of $0 cards that looks broken rather than new. This says what to do
 * first, in the order that makes the rest of the app light up, and disappears
 * on its own once all three are done — no dismissing required.
 *
 * The manual dismissal is stored per-browser rather than in the settings row:
 * it's a nudge, not a preference worth a database round-trip, and the worst
 * case of losing it is seeing a checklist you've already finished — which by
 * then hides itself anyway.
 */
export function SetupChecklist() {
  const { data: cash, isLoading: cashLoading } = useCashAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // A private window that refuses storage just means it comes back later.
    }
  }

  // Don't flash the checklist at someone whose data is still in flight.
  if (cashLoading || holdingsLoading || txLoading) return null;

  const steps = [
    {
      id: "cash",
      done: (cash ?? []).length > 0,
      label: "Add a cash account",
      why: "Your balances feed net worth and the cash runway.",
      action: <CashDialog />,
    },
    {
      id: "holdings",
      done: (holdings ?? []).length > 0,
      label: "Add your holdings",
      why: "Stocks, funds and crypto get priced automatically.",
      action: <HoldingDialog />,
    },
    {
      id: "transactions",
      done: (transactions ?? []).length > 0,
      label: "Log income and expenses",
      why: "Drives net income, the expense breakdown and your runway.",
      action: <TransactionDialog />,
    },
  ];

  const remaining = steps.filter((s) => !s.done).length;
  if (remaining === 0 || dismissed) return null;

  return (
    <Card className="mb-4 gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Finish setting up</h2>
          <p className="text-xs text-muted-foreground">
            {steps.length - remaining} of {steps.length} done — the dashboard fills in as you go.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dismiss setup checklist"
          onClick={dismiss}
          className="text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border",
                step.done
                  ? "border-positive bg-positive text-positive-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {step.done && <Check className="size-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                {step.label}
              </p>
              {!step.done && <p className="text-xs text-muted-foreground">{step.why}</p>}
            </div>
            {!step.done && step.action}
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Already have history? Backfill past months under{" "}
        <Link href="/account" className="font-medium text-primary hover:underline">
          Account → Net worth history
        </Link>{" "}
        so the charts have something to plot.
      </p>
    </Card>
  );
}
