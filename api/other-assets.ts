import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "../db/client.js";
import { otherAssets } from "../db/schema.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { otherAssetInsertSchema } from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const rows = await db.select().from(otherAssets);
    res.status(200).json(rows);
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

    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
