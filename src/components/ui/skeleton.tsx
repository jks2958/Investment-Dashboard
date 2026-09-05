import { cn } from "@/lib/utils";

/**
 * A placeholder block shaped like the content that's coming.
 *
 * Deliberately not a spinner: the point is to hold the right amount of space
 * so nothing jumps when the real content lands. Neon cold-starts make that
 * window long enough to see, and the widget grid is where it showed worst —
 * cards have fixed heights but their contents used to pop in one query at a
 * time.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-muted-foreground/15", className)}
      {...props}
    />
  );
}

/** The repeating shape behind every list in the app: a label stack on the
 *  left, a figure on the right. `rows` should match what the list usually
 *  holds, so the skeleton doesn't collapse into a shorter box than the data. */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("divide-y divide-border", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="ml-auto h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** For widgets that lead with a big number and then draw something. */
export function StatSkeleton({ chart = true }: { chart?: boolean }) {
  return (
    <div className="flex h-full flex-col gap-3" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-32" />
      {chart && <Skeleton className="min-h-20 flex-1" />}
    </div>
  );
}
