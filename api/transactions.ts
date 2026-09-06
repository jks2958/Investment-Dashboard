import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc, eq, gte } from "drizzle-orm";

import { db } from "../db/client.js";
import { recurringTransactions, transactions } from "../db/schema.js";
import { listRecurring, postDueTransactions } from "../lib/server/recurring.js";
import { currentUsdPkrRate, withUsd } from "../lib/server/money.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import {
  recurringInsertSchema,
  recurringUpdateSchema,
  transactionInsertSchema,
  transactionUpdateSchema,
} from "../lib/server/validation.js";

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Recurring templates share this function rather than getting their own file.
 * Vercel's Hobby plan caps a deployment at 12 serverless functions and this
 * project sits at 11, so `/api/recurring` is a rewrite onto `?kind=recurring`
 * instead of a twelfth.
 */
async function handleRecurring(req: VercelRequest, res: VercelResponse, idParam?: string) {
  if (idParam === undefined) {
    if (req.method === "GET") {
      const rate = await currentUsdPkrRate();
      const rows = await listRecurring();
      res.status(200).json(rows.map((row) => withUsd(row, ["amount"], rate)));
      return;
    }

    if (req.method === "POST") {
      const parsed = recurringInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }
      const { amount, ...rest } = parsed.data;
      const [created] = await db
        .insert(recurringTransactions)
        .values({ ...rest, amount: String(amount) })
        .returning();
      res.status(201).json(withUsd({ ...created, dueDates: [] }, ["amount"], await currentUsdPkrRate()));
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  // ?action=post turns the outstanding occurrences into real transactions.
  if (req.method === "POST" && one(req.query.action) === "post") {
    res.status(200).json(await postDueTransactions(id));
    return;
  }

  if (req.method === "PATCH") {
    const parsed = recurringUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    const { amount, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (amount !== undefined) updates.amount = String(amount);

    const [updated] = await db
      .update(recurringTransactions)
      .set(updates)
      .where(eq(recurringTransactions.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json(withUsd({ ...updated, dueDates: [] }, ["amount"], await currentUsdPkrRate()));
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db
      .delete(recurringTransactions)
      .where(eq(recurringTransactions.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const idParam = one(req.query.id);

  if (one(req.query.kind) === "recurring") {
    await handleRecurring(req, res, idParam);
    return;
  }

  if (idParam === undefined) {
    if (req.method === "GET") {
      // Bounded by date rather than by a row count. The old flat LIMIT 200
      // silently dropped older rows once the log grew, so the month picker on
      // the Income/Expense page would offer months it then showed as empty.
      const rawMonths = req.query.months;
      const monthsParam = Number(Array.isArray(rawMonths) ? rawMonths[0] : rawMonths);
      const months = Number.isFinite(monthsParam)
        ? Math.min(Math.max(monthsParam, 1), 120)
        : 24;

      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);
      const cutoffIso = cutoff.toISOString().slice(0, 10);

      const rate = await currentUsdPkrRate();
      const rows = await db
        .select()
        .from(transactions)
        .where(gte(transactions.occurredOn, cutoffIso))
        .orderBy(desc(transactions.occurredOn))
        .limit(5000);
      // Each row converts at the rate stored with it, not today's: a grocery
      // bill from March shouldn't re-price itself every time the rupee moves.
      res.status(200).json(
        rows.map((row) => withUsd(row, ["amount"], rate, row.fxRate === null ? null : Number(row.fxRate))),
      );
      return;
    }

    if (req.method === "POST") {
      const parsed = transactionInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }

      const { amount, ...rest } = parsed.data;
      const rate = await currentUsdPkrRate();
      // Stamped now and never revisited, which is what makes historical
      // figures stable.
      const fxRate = rest.currency === "PKR" ? String(rate) : null;
      const [created] = await db
        .insert(transactions)
        .values({ ...rest, amount: String(amount), fxRate })
        .returning();

      res.status(201).json(
        withUsd(created, ["amount"], rate, fxRate === null ? null : Number(fxRate)),
      );
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = transactionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { amount, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (amount !== undefined) updates.amount = String(amount);

    const rate = await currentUsdPkrRate();
    // Only a currency change re-stamps the rate. Correcting a typo in the
    // amount shouldn't silently re-price an old entry at today's rate.
    if (rest.currency !== undefined) {
      updates.fxRate = rest.currency === "PKR" ? String(rate) : null;
    }

    const [updated] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(
      withUsd(updated, ["amount"], rate, updated.fxRate === null ? null : Number(updated.fxRate)),
    );
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
