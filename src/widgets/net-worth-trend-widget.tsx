import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnapshotRange } from "@/hooks/use-snapshots";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Range = "30" | "90" | "365";

const RANGE_LABEL: Record<Range, string> = {
  "30": "Last 30 days",
  "90": "Last 90 days",
  "365": "Last year",
};

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function NetWorthTrendWidget() {
  const [range, setRange] = React.useState<Range>("30");
  const { data: snapshots, isLoading } = useSnapshotRange(Number(range));

  const points = (snapshots ?? []).map((s) => ({
    date: s.snapshotDate,
    value:
      Number(s.cashValue) +
      Number(s.stockValue) +
      Number(s.fundValue) +
      Number(s.cryptoValue) +
      Number(s.otherValue),
  }));

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAbs = first !== undefined && last !== undefined ? last - first : undefined;
  const changePct =
    first !== undefined && first > 0 && last !== undefined ? ((last - first) / first) * 100 : undefined;
  const up = (changeAbs ?? 0) >= 0;
  const color = up ? "var(--positive)" : "var(--destructive)";

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Net Worth Trend</p>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(RANGE_LABEL) as Range[]).map((key) => (
              <SelectItem key={key} value={key}>
                {RANGE_LABEL[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-semibold tabular-nums">
          {last !== undefined ? formatCurrency(last) : "—"}
        </p>
        {changeAbs !== undefined && changePct !== undefined && (
          <span className={cn("text-xs font-medium", up ? "text-positive" : "text-destructive")}>
            {up ? "+" : "−"}
            {formatCurrency(Math.abs(changeAbs))} ({formatPercent(changePct)})
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : points.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Not enough history yet. Your net worth is recorded once a day — check back tomorrow to
          start seeing a trend.
        </p>
      ) : (
        <div className="min-h-40 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="net-worth-trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                // Padded around the data rather than anchored at zero — from a
                // zero baseline a few percent of movement reads as a flat line.
                domain={[
                  (min: number) => min * 0.97,
                  (max: number) => max * 1.03,
                ]}
                tickFormatter={(v: number) => formatCompactCurrency(v)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), "Net worth"]}
                labelFormatter={(label) => String(label)}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill="url(#net-worth-trend-fill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
