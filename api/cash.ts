import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { cashAccounts } from "../db/schema.js";
import { currentUsdPkrRate, withUsd } from "../lib/server/money.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { cashInsertSchema, cashUpdateSchema } from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  const rawId = req.query.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;

  if (idParam === undefined) {
    if (req.method === "GET") {
      const rate = await currentUsdPkrRate();
      const rows = await db.select().from(cashAccounts);
      res.status(200).json(rows.map((row) => withUsd(row, ["balance"], rate)));
      return;
    }

    if (req.method === "POST") {
      const parsed = cashInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }

      const { balance, ...rest } = parsed.data;
      const [created] = await db
        .insert(cashAccounts)
        .values({ ...rest, balance: String(balance) })
        .returning();

      res.status(201).json(withUsd(created, ["balance"], await currentUsdPkrRate()));
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
    const parsed = cashUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { balance, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (balance !== undefined) updates.balance = String(balance);

    const [updated] = await db
      .update(cashAccounts)
      .set(updates)
      .where(eq(cashAccounts.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(withUsd(updated, ["balance"], await currentUsdPkrRate()));
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(cashAccounts).where(eq(cashAccounts.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
