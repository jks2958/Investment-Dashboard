import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An empty list should say what goes here and hand you the way to add it.
 *
 * The "Add X" button usually sits up in the card header, where the eye reads
 * it as chrome rather than as the answer to an empty list — so the action is
 * repeated here, at the point where you actually notice nothing's there.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  /** One line on why this is worth filling in — not just what it is. */
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-8 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
