import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { cashAccounts } from "../../db/schema.js";
import { requireAuth } from "../../lib/server/requireAuth.js";
import { cashUpdateSchema } from "../../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const id = Number(req.query.id);
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

    res.status(200).json(updated);
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
