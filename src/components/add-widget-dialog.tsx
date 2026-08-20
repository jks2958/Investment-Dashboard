import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { WidgetType } from "@/lib/api";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";

export function AddWidgetDialog({ onAdd }: { onAdd: (type: WidgetType) => void }) {
  const [open, setOpen] = React.useState(false);

  function handlePick(type: WidgetType) {
    onAdd(type);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" /> Add widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add widget</DialogTitle>
        </DialogHeader>
        <ul className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {(Object.entries(WIDGET_REGISTRY) as [WidgetType, (typeof WIDGET_REGISTRY)[WidgetType]][]).map(
            ([type, def]) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => handlePick(type)}
                  className="w-full rounded-lg border border-input px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                >
                  {def.label}
                </button>
              </li>
            ),
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
