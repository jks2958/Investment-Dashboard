import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "../db/client";
import { cashAccounts } from "../db/schema";
import { requireAuth } from "../lib/server/requireAuth";
import { cashInsertSchema } from "../lib/server/validation";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const rows = await db.select().from(cashAccounts);
    res.status(200).json(rows);
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

    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
