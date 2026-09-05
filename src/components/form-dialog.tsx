import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Lets one component serve both jobs: an "Add X" button that owns its own open
 * state, and an edit form opened by tapping a row, where the list owns it.
 * Pass open/onOpenChange for the second; omit them for the first.
 */
export function useDialogOpen(
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
): [boolean, (open: boolean) => void, boolean] {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const controlled = open !== undefined;
  // Controlled means something else opened this dialog — a row being edited,
  // or the command palette — so it must not also render its own "Add" button.
  return [open ?? uncontrolled, onOpenChange ?? setUncontrolled, controlled];
}

/**
 * Refills a form from the record being edited whenever the dialog opens.
 *
 * Keyed on open rather than on the record, so reopening a row you already
 * edited starts from what's saved — not from what you typed and cancelled.
 */
export function useFormReset(isOpen: boolean, fill: () => void) {
  // Held in a ref, and updated in its own effect rather than during render,
  // so the fill closure can be recreated every render without the open
  // effect below re-running and stamping over what's being typed.
  const fillRef = React.useRef(fill);
  React.useEffect(() => {
    fillRef.current = fill;
  });

  React.useEffect(() => {
    if (isOpen) fillRef.current();
  }, [isOpen]);
}

/**
 * The chrome every add/edit form in the app shares: the dialog, a title that
 * switches on mode, an error line, and a submit button that reports pending.
 */
export function FormDialog({
  mode,
  noun,
  trigger,
  open,
  onOpenChange,
  onSubmit,
  pending,
  error,
  submitLabel,
  children,
}: {
  mode: "create" | "edit";
  /** Lowercase, e.g. "holding" — titles read "Add holding" / "Edit holding". */
  noun: string;
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
  error?: string | null;
  /** Overrides the create-mode button text; edit mode always saves. */
  submitLabel?: string;
  children: React.ReactNode;
}) {
  const title = `${mode === "edit" ? "Edit" : "Add"} ${noun}`;
  const action = mode === "edit" ? "Save changes" : (submitLabel ?? title);
  const busy = mode === "edit" ? "Saving…" : "Adding…";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? busy : action}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
