import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { otherAssets } from "../db/schema.js";
import { currentUsdPkrRate, withUsd } from "../lib/server/money.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { otherAssetInsertSchema, otherAssetUpdateSchema } from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  const rawId = req.query.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;

  if (idParam === undefined) {
    if (req.method === "GET") {
      const rate = await currentUsdPkrRate();
      const rows = await db.select().from(otherAssets);
      res.status(200).json(rows.map((row) => withUsd(row, ["value"], rate)));
      return;
    }

    if (req.method === "POST") {
      const parsed = otherAssetInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }

      const { value, ...rest } = parsed.data;
      const [created] = await db
        .insert(otherAssets)
        .values({ ...rest, value: String(value) })
        .returning();

      res.status(201).json(withUsd(created, ["value"], await currentUsdPkrRate()));
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

    res.status(200).json(withUsd(updated, ["value"], await currentUsdPkrRate()));
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
