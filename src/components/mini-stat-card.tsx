import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/sparkline";
import { TREND_WINDOW_LABEL } from "@/lib/date-range";
import { formatCompactCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type MiniStatCardProps = {
  id: string;
  label: string;
  value: number;
  delta?: number;
  color: string;
  icon: LucideIcon;
  series: number[];
};

export function MiniStatCard({ id, label, value, delta, color, icon: Icon, series }: MiniStatCardProps) {
  return (
    <Card className="h-full gap-3 overflow-auto p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: color, color: "white" }}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div>
        <p className="text-xl font-semibold tabular-nums">{formatCompactCurrency(value)}</p>
        {delta !== undefined && (
          <p
            className={cn(
              "text-xs font-medium",
              delta >= 0 ? "text-positive" : "text-destructive",
            )}
          >
            {formatPercent(delta)}{" "}
            <span className="font-normal text-muted-foreground">
              over {TREND_WINDOW_LABEL}
            </span>
          </p>
        )}
      </div>
      <Sparkline data={series} color={color} id={id} />
    </Card>
  );
}
