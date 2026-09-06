import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "../db/client.js";
import { priceCache } from "../db/schema.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { refreshStalePrices } from "../lib/server/marketData.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await refreshStalePrices();
  const rows = await db.select().from(priceCache);
  res.status(200).json(rows);
}
