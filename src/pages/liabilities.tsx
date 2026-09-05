import * as React from "react";

import { AddCommitmentDialog } from "@/components/add-commitment-dialog";
import { AddDebtDialog } from "@/components/add-debt-dialog";
import { CommitmentsList } from "@/components/commitments-list";
import { DebtsList } from "@/components/debts-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCommitments } from "@/hooks/use-commitments";
import { useDebts } from "@/hooks/use-debts";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";
import { formatCurrency } from "@/lib/format";
import { summarizeDebts, totalRequiredMonthly } from "@/lib/liabilities";
import { cn } from "@/lib/utils";

type Tab = "debts" | "commitments";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "negative" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function LiabilitiesPage() {
  const [tab, setTab] = React.useState<Tab>("debts");
  const { data: debts } = useDebts();
  const { data: commitments } = useCommitments();
  const { totalAssets, netWorth } = usePortfolioTotals();

  const summary = summarizeDebts(debts ?? []);
  const requiredMonthly = totalRequiredMonthly(commitments ?? []);
  const confirmedMonthly = totalRequiredMonthly(commitments ?? [], ["confirmed"]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total assets" value={formatCurrency(totalAssets)} />
          <Stat label="Total owed" value={formatCurrency(summary.totalOwed)} tone="negative" />
          <Stat label="Net worth" value={formatCurrency(netWorth)} />
          <Stat label="Commitments need" value={`${formatCurrency(requiredMonthly)}/mo`} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(
          [
            ["debts", "Debts"],
            ["commitments", "Future commitments"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "debts" ? (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold">Debts</h2>
              <p className="text-xs text-muted-foreground">
                What you owe today. Subtracted from your net worth.
              </p>
            </div>
            <AddDebtDialog />
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.totalOwed > 0 && (
              <div className="flex flex-wrap gap-6 rounded-lg bg-accent/50 p-3">
                <Stat
                  label="Owed"
                  value={formatCurrency(summary.totalOwed)}
                  tone="negative"
                />
                <Stat
                  label="Monthly payments"
                  value={formatCurrency(summary.monthlyPayments)}
                />
                {summary.highestRate && (
                  <Stat
                    label="Highest rate"
                    value={`${summary.highestRate.name} · ${summary.highestRate.rate}%`}
                  />
                )}
              </div>
            )}
            <DebtsList />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold">Future commitments</h2>
              <p className="text-xs text-muted-foreground">
                Costs you know are coming. These don't reduce your net worth — they tell you what
                to save.
              </p>
            </div>
            <AddCommitmentDialog />
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredMonthly > 0 && (
              <div className="flex flex-wrap gap-6 rounded-lg bg-accent/50 p-3">
                <Stat label="Set aside monthly" value={formatCurrency(requiredMonthly)} />
                <Stat
                  label="Confirmed only"
                  value={formatCurrency(confirmedMonthly)}
                />
              </div>
            )}
            <CommitmentsList />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
