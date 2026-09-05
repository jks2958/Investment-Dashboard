import { TransactionDialog } from "@/components/transaction-dialog";
import { StatCard } from "@/components/stat-card";
import { TransactionsList } from "@/components/transactions-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { isInMonthOffset } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export function IncomeExpensePage() {
  const { data: transactions } = useTransactions();
  const rows = (transactions ?? []).filter((t) => isInMonthOffset(t.occurredOn, 0));

  const income = rows.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = rows.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Income this month" value={formatCurrency(income)} />
        <StatCard label="Expenses this month" value={formatCurrency(expense)} />
        <StatCard label="Net this month" value={formatCurrency(income - expense)} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Transactions</h2>
          <TransactionDialog />
        </CardHeader>
        <CardContent>
          <TransactionsList />
        </CardContent>
      </Card>
    </div>
  );
}
