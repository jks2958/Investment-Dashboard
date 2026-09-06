import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "../../db/client.js";
import { recurringTransactions, transactions } from "../../db/schema.js";
import { localTodayIso } from "./localDate.js";
import { currentUsdPkrRate } from "./money.js";

type Recurrence = "monthly" | "quarterly" | "yearly";

const STEP_MONTHS: Record<Recurrence, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/** Guard against a template whose start date is far enough back that stepping
 *  to today would loop for a long time. 40 years of monthly entries. */
const MAX_OCCURRENCES = 480;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Steps a date forward by whole months, keeping the day of month.
 *
 * A template starting on the 31st has to land somewhere in a 30-day month.
 * JavaScript's Date rolls 31 Sept into 1 Oct, which would silently drift the
 * whole series forward, so it's clamped to the last day of the target month —
 * rent due on the 31st is due on the 30th in September, not the 1st of October.
 */
function addMonths(from: Date, months: number, anchorDay: number): Date {
  const target = new Date(from.getFullYear(), from.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(anchorDay, lastDay));
  return target;
}

/**
 * Occurrence dates that have come due and haven't been posted yet.
 *
 * Only dates up to today: a template says what's expected, and posting next
 * month's rent today would put a transaction in the log that hasn't happened.
 */
export function dueOccurrences(
  row: {
    recurrence: Recurrence;
    startsOn: string;
    endsOn: string | null;
    lastPostedOn: string | null;
    active: boolean;
  },
  todayIso = localTodayIso(),
): string[] {
  if (!row.active) return [];

  const start = parseIso(row.startsOn);
  const anchorDay = start.getDate();
  const step = STEP_MONTHS[row.recurrence];

  const due: string[] = [];
  let cursor = start;

  for (let i = 0; i < MAX_OCCURRENCES; i++) {
    const iso = toIso(cursor);
    if (iso > todayIso) break;
    if (row.endsOn && iso > row.endsOn) break;
    if (!row.lastPostedOn || iso > row.lastPostedOn) due.push(iso);
    cursor = addMonths(start, step * (i + 1), anchorDay);
  }

  return due;
}

export async function listRecurring() {
  const rows = await db.select().from(recurringTransactions);
  return rows.map((row) => ({ ...row, dueDates: dueOccurrences(row) }));
}

/**
 * Turns every due occurrence of one template into a real transaction.
 *
 * Existing rows for the same date, type, category and amount are skipped, so
 * posting twice — a double tap, a retry after a dropped response — can't
 * duplicate an entry. `lastPostedOn` still advances either way.
 */
export async function postDueTransactions(id: number): Promise<{ posted: number }> {
  const [row] = await db
    .select()
    .from(recurringTransactions)
    .where(eq(recurringTransactions.id, id));

  if (!row) return { posted: 0 };

  const due = dueOccurrences(row);
  if (due.length === 0) return { posted: 0 };

  const existing = await db
    .select({ occurredOn: transactions.occurredOn, category: transactions.category })
    .from(transactions)
    .where(
      and(
        gte(transactions.occurredOn, due[0]),
        lte(transactions.occurredOn, due[due.length - 1]),
        eq(transactions.category, row.category),
        eq(transactions.type, row.type),
        eq(transactions.amount, row.amount),
        eq(transactions.currency, row.currency),
      ),
    );

  // A template carries its own currency, and posting stamps the rate now —
  // the same rule a hand-entered transaction follows.
  const rate = await currentUsdPkrRate();
  const fxRate = row.currency === "PKR" ? String(rate) : null;

  const alreadyThere = new Set(existing.map((e) => e.occurredOn));
  const toInsert = due
    .filter((date) => !alreadyThere.has(date))
    .map((date) => ({
      type: row.type,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      fxRate,
      occurredOn: date,
      note: row.note ?? "Recurring",
    }));

  if (toInsert.length > 0) await db.insert(transactions).values(toInsert);

  await db
    .update(recurringTransactions)
    .set({ lastPostedOn: due[due.length - 1] })
    .where(eq(recurringTransactions.id, id));

  return { posted: toInsert.length };
}
