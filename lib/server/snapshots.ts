import { desc } from "drizzle-orm";

import { db } from "../../db/client";
import { netWorthSnapshots } from "../../db/schema";
import { computeAssetTypeValues } from "./portfolioValue";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordTodaySnapshot(): Promise<void> {
  const values = await computeAssetTypeValues();

  await db
    .insert(netWorthSnapshots)
    .values({
      snapshotDate: todayIso(),
      cashValue: String(values.cash),
      stockValue: String(values.stock),
      fundValue: String(values.fund),
      cryptoValue: String(values.crypto),
      otherValue: String(values.other),
      totalInvested: String(values.totalInvested),
    })
    .onConflictDoUpdate({
      target: netWorthSnapshots.snapshotDate,
      set: {
        cashValue: String(values.cash),
        stockValue: String(values.stock),
        fundValue: String(values.fund),
        cryptoValue: String(values.crypto),
        otherValue: String(values.other),
        totalInvested: String(values.totalInvested),
      },
    });
}

export async function getRecentSnapshots(days: number) {
  const rows = await db
    .select()
    .from(netWorthSnapshots)
    .orderBy(desc(netWorthSnapshots.snapshotDate))
    .limit(days);

  return rows.reverse();
}
