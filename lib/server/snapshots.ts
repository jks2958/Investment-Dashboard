import { desc, eq, gte } from "drizzle-orm";

import { db } from "../../db/client.js";
import { netWorthSnapshots } from "../../db/schema.js";
import { computeAssetTypeValues } from "./portfolioValue.js";
import { localTodayIso } from "./localDate.js";

/** Guards against an unbounded read once years of history accumulate. */
const MAX_ROWS = 800;

export type SnapshotEntry = {
  snapshotDate: string;
  cashValue: number;
  stockValue: number;
  fundValue: number;
  cryptoValue: number;
  otherValue: number;
  debtTotal: number;
};

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
    .values({ snapshotDate: localTodayIso(), ...row })
    .onConflictDoUpdate({ target: netWorthSnapshots.snapshotDate, set: row });
}

export async function getRecentSnapshots(days: number) {
  // Filter by date rather than LIMIT n. They're equivalent while a row exists
  // for every day, but once history is backfilled sparsely (say month-end
  // rows only) a row limit would quietly return years for "last 30 days".
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(
    cutoff.getDate(),
  ).padStart(2, "0")}`;

  const rows = await db
    .select()
    .from(netWorthSnapshots)
    .where(gte(netWorthSnapshots.snapshotDate, cutoffIso))
    .orderBy(desc(netWorthSnapshots.snapshotDate))
    .limit(MAX_ROWS);

  return rows.reverse();
}

/** Every snapshot, newest first — for the history editor. */
export async function listAllSnapshots() {
  return db
    .select()
    .from(netWorthSnapshots)
    .orderBy(desc(netWorthSnapshots.snapshotDate))
    .limit(MAX_ROWS);
}

export async function upsertSnapshots(entries: SnapshotEntry[]): Promise<void> {
  for (const entry of entries) {
    const row = {
      cashValue: String(entry.cashValue),
      stockValue: String(entry.stockValue),
      fundValue: String(entry.fundValue),
      cryptoValue: String(entry.cryptoValue),
      otherValue: String(entry.otherValue),
      debtTotal: String(entry.debtTotal),
      totalInvested: "0",
    };

    await db
      .insert(netWorthSnapshots)
      .values({ snapshotDate: entry.snapshotDate, ...row })
      .onConflictDoUpdate({ target: netWorthSnapshots.snapshotDate, set: row });
  }
}

export async function deleteSnapshot(date: string): Promise<boolean> {
  const [deleted] = await db
    .delete(netWorthSnapshots)
    .where(eq(netWorthSnapshots.snapshotDate, date))
    .returning();

  return Boolean(deleted);
}
