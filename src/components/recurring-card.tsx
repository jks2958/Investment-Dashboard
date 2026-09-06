import * as React from "react";
import { CalendarSync, Check, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { RecurringDialog } from "@/components/recurring-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeleton";
import {
  useDeleteRecurring,
  usePostRecurring,
  useRecurring,
  useUpdateRecurring,
} from "@/hooks/use-recurring";
import type { Recurrence, RecurringTransaction } from "@/lib/api";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  monthly: "monthly",
  quarterly: "quarterly",
  yearly: "yearly",
};

export function RecurringCard() {
  const { data: rows, isLoading } = useRecurring();
  const post = usePostRecurring();
  const update = useUpdateRecurring();
  const remove = useDeleteRecurring();
  const [editing, setEditing] = React.useState<RecurringTransaction | undefined>();

  const templates = rows ?? [];
  const totalDue = templates.reduce((sum, r) => sum + r.dueDates.length, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold">Recurring entries</h2>
          <p className="text-xs text-muted-foreground">
            Templates for what repeats. Nothing is logged until you confirm it.
          </p>
        </div>
        <RecurringDialog />
      </CardHeader>
      <CardContent className="space-y-3">
        {totalDue > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-warning/10 p-3">
            <p className="text-sm">
              <span className="font-medium">{totalDue}</span> entr
              {totalDue === 1 ? "y is" : "ies are"} due.
            </p>
            <Button
              size="sm"
              disabled={post.isPending}
              onClick={async () => {
                // Sequential rather than parallel: each post reads and then
                // writes lastPostedOn, and the confirmation count should be
                // accurate rather than fast.
                for (const row of templates.filter((r) => r.dueDates.length > 0)) {
                  await post.mutateAsync(row.id);
                }
              }}
            >
              {post.isPending ? "Adding…" : "Add them all"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : templates.length === 0 ? (
          <EmptyState
            icon={CalendarSync}
            title="Nothing set up yet"
            description="Salary, rent, utilities, school fees — anything you'd otherwise retype every month."
            action={<RecurringDialog />}
          />
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((row) => {
              const due = row.dueDates.length;
              const nextLabel = due > 0 ? `${due} due` : row.lastPostedOn
                ? `last added ${formatDateShort(row.lastPostedOn)}`
                : `starts ${formatDateShort(row.startsOn)}`;

              return (
                <li key={row.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate font-medium", !row.active && "text-muted-foreground")}>
                      {row.category}
                      {!row.active && " · paused"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {RECURRENCE_LABEL[row.recurrence]} · {nextLabel}
                      {row.endsOn ? ` · until ${formatDateShort(row.endsOn)}` : ""}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "font-medium tabular-nums",
                      row.type === "income" ? "text-positive" : "text-destructive",
                    )}
                  >
                    {row.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(row.amount))}
                  </p>
                  {due > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={post.isPending}
                      onClick={() => post.mutate(row.id)}
                    >
                      <Check className="size-4" /> Add {due}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() =>
                      update.mutate({ id: row.id, input: { active: !row.active } })
                    }
                  >
                    {row.active ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${row.category}`}
                    onClick={() => setEditing(row)}
                    className="text-muted-foreground"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton
                    label={row.category}
                    detail={`${RECURRENCE_LABEL[row.recurrence]} ${formatCurrency(
                      Number(row.amount),
                    )}. Transactions already logged from it are kept`}
                    onConfirm={() => remove.mutate(row.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      {editing && (
        <RecurringDialog
          editing={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(undefined);
          }}
        />
      )}
    </Card>
  );
}
