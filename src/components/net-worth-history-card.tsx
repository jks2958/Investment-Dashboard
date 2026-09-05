import { Trash2 } from "lucide-react";

import { AddSnapshotDialog } from "@/components/add-snapshot-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAllSnapshots, useDeleteSnapshot } from "@/hooks/use-snapshots";
import { formatDateShort, todayIso } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

function netWorthOf(s: {
  cashValue: string;
  stockValue: string;
  fundValue: string;
  cryptoValue: string;
  otherValue: string;
  debtTotal: string;
}): number {
  return (
    Number(s.cashValue) +
    Number(s.stockValue) +
    Number(s.fundValue) +
    Number(s.cryptoValue) +
    Number(s.otherValue) -
    Number(s.debtTotal ?? 0)
  );
}

export function NetWorthHistoryCard() {
  const { data: snapshots, isLoading } = useAllSnapshots();
  const deleteSnapshot = useDeleteSnapshot();
  const today = todayIso();

  const rows = snapshots ?? [];

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold">Net worth history</h2>
          <p className="text-xs text-muted-foreground">
            What the trend chart and sparklines read. Today's row records itself; add
            past dates here to backfill.
          </p>
        </div>
        <AddSnapshotDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No history yet. Add past dates to give the charts something to plot.
          </p>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-auto">
            {rows.map((snapshot) => {
              const isToday = snapshot.snapshotDate === today;
              return (
                <li
                  key={snapshot.snapshotDate}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {formatDateShort(snapshot.snapshotDate)}
                      {isToday && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          today · automatic
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">
                      cash {formatCurrency(Number(snapshot.cashValue))} · invested{" "}
                      {formatCurrency(
                        Number(snapshot.stockValue) +
                          Number(snapshot.fundValue) +
                          Number(snapshot.cryptoValue),
                      )}
                      {Number(snapshot.debtTotal) > 0 &&
                        ` · owed ${formatCurrency(Number(snapshot.debtTotal))}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium tabular-nums">
                      {formatCurrency(netWorthOf(snapshot))}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${snapshot.snapshotDate}`}
                      onClick={() => deleteSnapshot.mutate(snapshot.snapshotDate)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
