import { desc } from "drizzle-orm";

import { db } from "../../db/client.js";
import { netWorthSnapshots } from "../../db/schema.js";
import { computeAssetTypeValues } from "./portfolioValue.js";

/** Local-time date, so a snapshot lands on the day the user is actually in. */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export async function recordTodaySnapshot(): Promise<void> {
  const values = await computeAssetTypeValues();

  const row = {
    cashValue: String(values.cash),
    stockValue: String(values.stock),
    fundValue: String(values.fund),
    cryptoValue: String(values.crypto),
    otherValue: String(values.other),
    debtTotal: String(values.debt),
    totalInvested: String(values.totalInvested),
  };

  await db
    .insert(netWorthSnapshots)
    .values({ snapshotDate: todayIso(), ...row })
    .onConflictDoUpdate({ target: netWorthSnapshots.snapshotDate, set: row });
}

export async function getRecentSnapshots(days: number) {
  const rows = await db
    .select()
    .from(netWorthSnapshots)
    .orderBy(desc(netWorthSnapshots.snapshotDate))
    .limit(days);

  return rows.reverse();
}
