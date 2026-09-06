import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { wishlistItems } from "../db/schema.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import {
  wishlistInsertSchema,
  wishlistUpdateSchema,
} from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  const rawId = req.query.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;

  if (idParam === undefined) {
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
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = wishlistUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { targetPrice, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    // Clearing a target is meaningful, so an explicit null has to survive
    // rather than being dropped as "no change".
    if (targetPrice !== undefined) updates.targetPrice = String(targetPrice);
    else if (req.body?.targetPrice === null) updates.targetPrice = null;

    const [updated] = await db
      .update(wishlistItems)
      .set(updates)
      .where(eq(wishlistItems.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(wishlistItems).where(eq(wishlistItems.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
