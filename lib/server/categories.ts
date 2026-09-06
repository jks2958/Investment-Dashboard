import { eq, sql } from "drizzle-orm";

import { db } from "../../db/client.js";
import { budgets, recurringTransactions, transactions } from "../../db/schema.js";

/**
 * Keeps one spelling of each category.
 *
 * Category is free text, and the expense breakdown groups by exact string. So
 * "Groceries" typed once and "groceries" the next time became two slices, two
 * filter entries and two half-sized numbers, with nothing to signal it. On a
 * tablet, where the keyboard capitalises the first letter for you, that's not
 * an edge case.
 *
 * The rule is: if a category already exists that differs only by case or
 * surrounding space, reuse the existing spelling. The first spelling wins, and
 * later entries join it rather than starting a rival.
 */
export async function canonicalCategory(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  // Both sides are trimmed as well as lower-cased: a row saved as
  // "  Groceries " before this existed would otherwise never match, and would
  // sit in every report as its own category forever.
  const [existing] = await db
    .select({
      category: transactions.category,
      count: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(sql`btrim(lower(${transactions.category})) = ${trimmed.toLowerCase()}`)
    .groupBy(transactions.category)
    // Most-used spelling wins, so the result doesn't depend on row order.
    .orderBy(sql`count(*) desc`)
    .limit(1);

  return existing?.category ?? trimmed;
}

/**
 * Repoints every row on `from` to `into`, for duplicates already recorded.
 *
 * Budgets are moved too, and a collision there is resolved by dropping the
 * losing row rather than failing: the unique constraint on category means two
 * budgets can't survive a merge, and the surviving cap is the one the user is
 * merging into.
 */
export async function mergeCategory(from: string, into: string): Promise<{ moved: number }> {
  if (!from.trim() || !into.trim() || from === into) return { moved: 0 };

  const key = from.trim().toLowerCase();

  // `<> into` keeps the count honest: rows already carrying the target
  // spelling are matched by the case-insensitive compare but haven't moved.
  const moved = await db
    .update(transactions)
    .set({ category: into })
    .where(
      sql`btrim(lower(${transactions.category})) = ${key} and ${transactions.category} <> ${into}`,
    )
    .returning({ id: transactions.id });

  await db
    .update(recurringTransactions)
    .set({ category: into })
    .where(sql`btrim(lower(${recurringTransactions.category})) = ${key}`);

  const [target] = await db.select().from(budgets).where(eq(budgets.category, into));
  if (target) {
    await db
      .delete(budgets)
      .where(sql`btrim(lower(${budgets.category})) = ${key} and ${budgets.category} <> ${into}`);
  } else {
    await db
      .update(budgets)
      .set({ category: into })
      .where(sql`btrim(lower(${budgets.category})) = ${key}`);
  }

  return { moved: moved.length };
}

/** Distinct categories with how many rows use each, so the merge UI can show
 *  which spelling is the established one. */
export async function listCategories() {
  const rows = await db
    .select({
      category: transactions.category,
      count: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .groupBy(transactions.category)
    .orderBy(sql`count(*) desc`);
  return rows;
}
