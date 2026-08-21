import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { holdings, priceCache } from "../db/schema.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { refreshStalePrices } from "../lib/server/marketData.js";
import { holdingInsertSchema } from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    await refreshStalePrices();

    const rows = await db
      .select({
        id: holdings.id,
        symbol: holdings.symbol,
        assetType: holdings.assetType,
        quantity: holdings.quantity,
        avgCostBasis: holdings.avgCostBasis,
        account: holdings.account,
        lastPrice: priceCache.lastPrice,
        priceFetchedAt: priceCache.fetchedAt,
      })
      .from(holdings)
      .leftJoin(priceCache, eq(holdings.symbol, priceCache.symbol));

    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const parsed = holdingInsertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { quantity, avgCostBasis, ...rest } = parsed.data;
    const [created] = await db
      .insert(holdings)
      .values({ ...rest, quantity: String(quantity), avgCostBasis: String(avgCostBasis) })
      .returning();

    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
