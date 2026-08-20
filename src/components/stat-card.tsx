import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

type StatCardProps = {
  label: string;
  value: string;
  delta?: number;
  className?: string;
};

export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "text-sm font-medium",
              delta >= 0 ? "text-positive" : "text-destructive",
            )}
          >
            {formatPercent(delta)}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
