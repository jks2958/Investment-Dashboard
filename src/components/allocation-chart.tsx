import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatCurrency } from "@/lib/format";

export type AllocationSlice = {
  key: "stock" | "fund" | "crypto" | "cash" | "other";
  label: string;
  value: number;
};

const COLOR_VAR: Record<AllocationSlice["key"], string> = {
  stock: "var(--trend-stock)",
  fund: "var(--trend-fund)",
  crypto: "var(--trend-crypto)",
  cash: "var(--trend-cash)",
  other: "var(--trend-other)",
};

export function AllocationChart({ data }: { data: AllocationSlice[] }) {
  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add holdings or a cash balance to see your allocation.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={COLOR_VAR[slice.key]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-3">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLOR_VAR[slice.key] }}
              />
              {slice.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-medium tabular-nums">
                {((slice.value / total) * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatCurrency(slice.value)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
