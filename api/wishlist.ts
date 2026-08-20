import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc } from "drizzle-orm";

import { db } from "../db/client";
import { wishlistItems } from "../db/schema";
import { requireAuth } from "../lib/server/requireAuth";
import { wishlistInsertSchema } from "../lib/server/validation";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const rows = await db.select().from(wishlistItems).orderBy(desc(wishlistItems.createdAt));
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const parsed = wishlistInsertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { targetPrice, ...rest } = parsed.data;
    const [created] = await db
      .insert(wishlistItems)
      .values({ ...rest, targetPrice: targetPrice !== undefined ? String(targetPrice) : null })
      .returning();

    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
