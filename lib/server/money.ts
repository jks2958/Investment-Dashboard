import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { dashboardSettings } from "../../db/schema.js";

export type Currency = "USD" | "PKR";

/**
 * USD is the unit every total, chart and snapshot is computed in.
 *
 * What changed is only where the number comes from: rows now record the amount
 * as it was actually entered, plus its currency, so a rupee figure never has to
 * be divided by hand. The API still reports USD in the same fields it always
 * did, which is why none of the aggregation code had to learn about currencies.
 *
 * The asymmetry to keep in mind: on the way **in**, an amount is in the row's
 * own currency; on the way **out**, it is USD.
 */
export function toUsd(amount: number, currency: Currency, usdPkrRate: number): number {
  if (currency !== "PKR") return amount;
  // A zero or missing rate would turn every rupee balance into Infinity and
  // poison every total on the dashboard. Falling back leaves figures wrong by
  // the drift in the rate, which is recoverable; Infinity is not.
  if (!Number.isFinite(usdPkrRate) || usdPkrRate <= 0) return amount;
  return amount / usdPkrRate;
}

/** Reads the stored USD→PKR rate. Balances convert at today's rate, so this is
 *  read per request rather than cached. */
export async function currentUsdPkrRate(): Promise<number> {
  const [row] = await db
    .select({ rate: dashboardSettings.usdPkrRate })
    .from(dashboardSettings)
    .where(eq(dashboardSettings.id, 1));

  const rate = Number(row?.rate ?? 280);
  return Number.isFinite(rate) && rate > 0 ? rate : 280;
}

/**
 * Converts one money field of a row for the response.
 *
 * `nativeX` is added alongside so the edit form can show what was typed rather
 * than a converted figure the user never entered.
 */
export function withUsd<T extends Record<string, unknown>>(
  row: T,
  fields: (keyof T & string)[],
  rate: number,
  /** Transactions pass their frozen rate here instead of today's. */
  rowRate?: number | null,
): T & Record<string, unknown> {
  const currency = (row.currency as Currency) ?? "USD";
  const effective = currency === "PKR" ? (rowRate ?? rate) : rate;

  const out: Record<string, unknown> = { ...row, fxRateUsed: currency === "PKR" ? effective : null };
  for (const field of fields) {
    const native = Number(row[field] ?? 0);
    out[`native${field.charAt(0).toUpperCase()}${field.slice(1)}`] = row[field];
    out[field] = String(toUsd(native, currency, effective));
  }
  return out as T & Record<string, unknown>;
}
