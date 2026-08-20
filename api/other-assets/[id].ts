import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import { otherAssets } from "../../db/schema";
import { requireAuth } from "../../lib/server/requireAuth";
import { otherAssetUpdateSchema } from "../../lib/server/validation";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const id = Number(req.query.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = otherAssetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { value, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (value !== undefined) updates.value = String(value);

    const [updated] = await db
      .update(otherAssets)
      .set(updates)
      .where(eq(otherAssets.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(otherAssets).where(eq(otherAssets.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
