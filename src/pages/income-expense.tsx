import * as React from "react";
import { Search, X } from "lucide-react";

import { RecurringCard } from "@/components/recurring-card";
import { StatCard } from "@/components/stat-card";
import { TransactionDialog } from "@/components/transaction-dialog";
import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { currentMonthLabel } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import {
  ALL_CATEGORIES,
  ALL_MONTHS,
  EMPTY_FILTER,
  applyFilter,
  categoriesPresent,
  monthLabel,
  monthsPresent,
  summarize,
  type TransactionFilter,
} from "@/lib/transaction-filters";
import { BudgetsWidget } from "@/widgets/budgets-widget";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function IncomeExpensePage() {
  const { data: transactions } = useTransactions();
  const all = React.useMemo(() => transactions ?? [], [transactions]);

  // Opens on the current month, matching what the stat cards used to show —
  // the list underneath them used to show everything, so the numbers and the
  // rows disagreed.
  const [filter, setFilter] = React.useState<TransactionFilter>({
    ...EMPTY_FILTER,
    month: currentMonthKey(),
  });

  const months = React.useMemo(() => monthsPresent(all), [all]);
  const categories = React.useMemo(() => categoriesPresent(all), [all]);
  const rows = React.useMemo(() => applyFilter(all, filter), [all, filter]);
  const totals = summarize(rows);

  const set = <K extends keyof TransactionFilter>(key: K, value: TransactionFilter[K]) =>
    setFilter((f) => ({ ...f, [key]: value }));

  const isFiltered =
    filter.month !== ALL_MONTHS ||
    filter.type !== "all" ||
    filter.category !== ALL_CATEGORIES ||
    filter.query.trim() !== "";

  const scope =
    filter.month === ALL_MONTHS ? "in view" : monthLabel(filter.month) === currentMonthLabel()
      ? "this month"
      : monthLabel(filter.month);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Income ${scope}`} value={formatCurrency(totals.income)} />
        <StatCard label={`Expenses ${scope}`} value={formatCurrency(totals.expense)} />
        <StatCard label={`Net ${scope}`} value={formatCurrency(totals.net)} />
      </div>

      <BudgetsWidget manage />

      <RecurringCard />

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Transactions</h2>
          <TransactionDialog />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter.month} onValueChange={(v) => set("month", v)}>
              <SelectTrigger className="h-9 w-44" aria-label="Month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_MONTHS}>All months</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {monthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.type}
              onValueChange={(v) => set("type", v as TransactionFilter["type"])}
            >
              <SelectTrigger className="h-9 w-32" aria-label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Income &amp; expense</SelectItem>
                <SelectItem value="income">Income only</SelectItem>
                <SelectItem value="expense">Expenses only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="h-9 w-40" aria-label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative min-w-40 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter.query}
                onChange={(e) => set("query", e.target.value)}
                placeholder="Search category or note"
                aria-label="Search transactions"
                className="h-9 pl-9"
              />
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter({ ...EMPTY_FILTER })}
                className="text-muted-foreground"
              >
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>

          <TransactionsList
            rows={rows}
            isFiltered={isFiltered}
            onClearFilters={() => setFilter({ ...EMPTY_FILTER })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
