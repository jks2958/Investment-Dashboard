import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The single way anything gets deleted in this app.
 *
 * Every delete used to fire straight from onClick. On a tablet the trash icon
 * sits a thumb's width from the row's value, and there's no undo behind it —
 * one mis-tap took a holding's cost basis and purchase date with it. So the
 * confirmation names the exact record rather than asking "are you sure?", and
 * `detail` carries whatever would be painful to retype.
 */
export function DeleteButton({
  label,
  detail,
  onConfirm,
  pending = false,
  className,
}: {
  /** The record's name, shown in the title — "Delete AAPL?" */
  label: string;
  /** What's lost with it, e.g. "40 units, bought 12 Mar 2024". */
  detail?: string;
  onConfirm: () => void;
  pending?: boolean;
  className?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${label}`}
          disabled={pending}
          className={cn("text-muted-foreground hover:text-destructive", className)}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
        <AlertDialogDescription>
          {detail ? `${detail}. ` : ""}This can't be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
