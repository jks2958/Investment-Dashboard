import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveSnapshots } from "@/hooks/use-snapshots";
import type { SnapshotEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "single" | "bulk";

const FIELDS = [
  { key: "cashValue", label: "Cash" },
  { key: "stockValue", label: "Stocks" },
  { key: "fundValue", label: "Funds" },
  { key: "cryptoValue", label: "Crypto" },
  { key: "otherValue", label: "Other assets" },
  { key: "debtTotal", label: "Debt owed" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

const EMPTY: Record<FieldKey, string> = {
  cashValue: "",
  stockValue: "",
  fundValue: "",
  cryptoValue: "",
  otherValue: "",
  debtTotal: "",
};

/** Yesterday — today's row is recomputed on every dashboard load, so letting
 *  it be typed here would just be overwritten. */
function latestBackfillDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const BULK_EXAMPLE = `2025-01-31, 40000, 12000, 5000, 3000, 10000, 22000
2025-02-28, 41500, 12800, 5100, 3400, 10000, 21500`;

type ParsedBulk = { entries: SnapshotEntry[]; errors: string[] };

function parseBulk(text: string): ParsedBulk {
  const entries: SnapshotEntry[] = [];
  const errors: string[] = [];

  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line, index) => {
      // Tolerate a header row so a pasted spreadsheet export just works.
      if (/[a-z]{3,}/i.test(line.split(/[,\t]/)[0] ?? "")) return;

      const parts = line.split(/[,\t]/).map((p) => p.trim());
      if (parts.length < 7) {
        errors.push(`Line ${index + 1}: expected 7 values, found ${parts.length}`);
        return;
      }

      const [date, ...rest] = parts;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push(`Line ${index + 1}: "${date}" is not a YYYY-MM-DD date`);
        return;
      }

      const numbers = rest.slice(0, 6).map((v) => Number(v.replace(/[$,\s]/g, "")));
      if (numbers.some((n) => !Number.isFinite(n) || n < 0)) {
        errors.push(`Line ${index + 1}: values must be non-negative numbers`);
        return;
      }

      entries.push({
        snapshotDate: date,
        cashValue: numbers[0],
        stockValue: numbers[1],
        fundValue: numbers[2],
        cryptoValue: numbers[3],
        otherValue: numbers[4],
        debtTotal: numbers[5],
      });
    });

  return { entries, errors };
}

export function AddSnapshotDialog() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("single");
  const [snapshotDate, setSnapshotDate] = React.useState(latestBackfillDate());
  const [values, setValues] = React.useState<Record<FieldKey, string>>(EMPTY);
  const [bulkText, setBulkText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const save = useSaveSnapshots();

  const parsedBulk = React.useMemo(() => parseBulk(bulkText), [bulkText]);

  const singleTotal =
    FIELDS.filter((f) => f.key !== "debtTotal").reduce(
      (sum, f) => sum + (Number(values[f.key]) || 0),
      0,
    ) - (Number(values.debtTotal) || 0);

  function reset() {
    setMode("single");
    setSnapshotDate(latestBackfillDate());
    setValues(EMPTY);
    setBulkText("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries: SnapshotEntry[] =
      mode === "single"
        ? [
            {
              snapshotDate,
              cashValue: Number(values.cashValue) || 0,
              stockValue: Number(values.stockValue) || 0,
              fundValue: Number(values.fundValue) || 0,
              cryptoValue: Number(values.cryptoValue) || 0,
              otherValue: Number(values.otherValue) || 0,
              debtTotal: Number(values.debtTotal) || 0,
            },
          ]
        : parsedBulk.entries;

    if (entries.length === 0) {
      setError("Nothing to save.");
      return;
    }

    try {
      await save.mutateAsync(entries);
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Add history</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add net worth history</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          {(
            [
              ["single", "One date"],
              ["bulk", "Paste many"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                mode === value
                  ? "bg-nav-active text-nav-active-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "single" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="snapshotDate">Date</Label>
                <Input
                  id="snapshotDate"
                  type="date"
                  value={snapshotDate}
                  max={latestBackfillDate()}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {FIELDS.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      step="any"
                      min="0"
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues({ ...values, [field.key]: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Net worth on that date:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(singleTotal)}
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="bulkText">
                  One row per line: date, cash, stocks, funds, crypto, other, debt
                </Label>
                <textarea
                  id="bulkText"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  placeholder={BULK_EXAMPLE}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {parsedBulk.entries.length > 0 && (
                <p className="text-xs text-positive">
                  {parsedBulk.entries.length} row
                  {parsedBulk.entries.length === 1 ? "" : "s"} ready to import.
                </p>
              )}
              {parsedBulk.errors.length > 0 && (
                <ul className="space-y-0.5 text-xs text-destructive">
                  {parsedBulk.errors.slice(0, 4).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                A header row is ignored, and commas or tabs both work — so a
                spreadsheet copy-paste goes straight in.
              </p>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save history"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
