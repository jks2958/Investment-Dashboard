import * as React from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCashAccounts } from "@/hooks/use-cash";
import { useCommitments } from "@/hooks/use-commitments";
import { useDebts } from "@/hooks/use-debts";
import { useHoldings } from "@/hooks/use-holdings";
import { useOtherAssets } from "@/hooks/use-other-assets";
import { useAllSnapshots } from "@/hooks/use-snapshots";
import { useTransactions } from "@/hooks/use-transactions";
import { useWishlist } from "@/hooks/use-wishlist";
import {
  countRows,
  downloadCsvs,
  downloadJson,
  type ExportTable,
} from "@/lib/export-data";

export function ExportCard() {
  const holdings = useHoldings();
  const cash = useCashAccounts();
  const otherAssets = useOtherAssets();
  const transactions = useTransactions();
  const wishlist = useWishlist();
  const debts = useDebts();
  const commitments = useCommitments();
  const snapshots = useAllSnapshots();

  const queries = [holdings, cash, otherAssets, transactions, wishlist, debts, commitments, snapshots];
  const loading = queries.some((q) => q.isLoading);

  const tables: ExportTable[] = React.useMemo(
    () => [
      { name: "holdings", rows: holdings.data ?? [] },
      { name: "cash-accounts", rows: cash.data ?? [] },
      { name: "other-assets", rows: otherAssets.data ?? [] },
      { name: "transactions", rows: transactions.data ?? [] },
      { name: "wishlist", rows: wishlist.data ?? [] },
      { name: "debts", rows: debts.data ?? [] },
      { name: "commitments", rows: commitments.data ?? [] },
      { name: "net-worth-history", rows: snapshots.data ?? [] },
    ],
    [
      holdings.data,
      cash.data,
      otherAssets.data,
      transactions.data,
      wishlist.data,
      debts.data,
      commitments.data,
      snapshots.data,
    ],
  );

  const total = countRows(tables);
  const nonEmpty = tables.filter((t) => t.rows.length > 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold">Export your data</h2>
          <p className="text-xs text-muted-foreground">
            Everything lives in one database. Keep a copy somewhere you control.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || total === 0}
            onClick={() => downloadJson(tables)}
          >
            <Download className="size-4" /> Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || total === 0}
            onClick={() => downloadCsvs(tables)}
          >
            <Download className="size-4" /> Download CSVs
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {loading
            ? "Gathering your records…"
            : total === 0
              ? "Nothing to export yet."
              : `${total} records across ${nonEmpty.length} tables. JSON is one file with everything; CSVs are one file per table, so your browser may ask permission to download several at once.`}
        </p>
        <p className="text-xs text-muted-foreground">
          Transactions cover the last 24 months — the window the app keeps loaded. Net worth
          history exports in full.
        </p>
      </CardContent>
    </Card>
  );
}
