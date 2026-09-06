import * as React from "react";

import { FormDialog, useDialogOpen, useFormReset } from "@/components/form-dialog";
import { MoneyInput } from "@/components/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import type { Budget, EntryCurrency } from "@/lib/api";

export function BudgetDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: Budget;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [category, setCategory] = React.useState("");
  const [monthlyLimit, setMonthlyLimit] = React.useState("");
  const [currency, setCurrency] = React.useState<EntryCurrency>("USD");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateBudget();
  const update = useUpdateBudget();
  const { data: knownCategories } = useCategories();

  useFormReset(isOpen, () => {
    setCategory(editing?.category ?? "");
    setMonthlyLimit(
      editing ? String(Number(editing.nativeMonthlyLimit ?? editing.monthlyLimit)) : "",
    );
    setCurrency(editing?.currency ?? "USD");
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = { category, monthlyLimit: Number(monthlyLimit), currency };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input });
      else await create.mutateAsync(input);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <FormDialog
      mode={editing ? "edit" : "create"}
      noun="budget"
      trigger={
        editing || controlled ? undefined : (
          <Button size="sm" variant="outline">
            Set a budget
          </Button>
        )
      }
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="budgetCategory">Category</Label>
        <Input
          id="budgetCategory"
          list="known-categories"
          autoCapitalize="none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Groceries"
          required
          disabled={Boolean(editing)}
        />
        <datalist id="known-categories">
          {(knownCategories ?? []).map((c) => (
            <option key={c.category} value={c.category} />
          ))}
        </datalist>
        {editing && (
          <p className="text-xs text-muted-foreground">
            To budget a different category, add a new one — this keeps the history attached to
            the right name.
          </p>
        )}
      </div>

      <MoneyInput
        id="budgetLimit"
        label="Monthly limit"
        value={monthlyLimit}
        onValueChange={setMonthlyLimit}
        currency={currency}
        onCurrencyChange={setCurrency}
        required
        hint="Compared against this calendar month's expenses in that category."
      />
    </FormDialog>
  );
}
