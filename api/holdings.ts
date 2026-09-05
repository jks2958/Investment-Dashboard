import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { holdings, priceCache } from "../db/schema.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { refreshStalePrices } from "../lib/server/marketData.js";
import { holdingInsertSchema, holdingUpdateSchema } from "../lib/server/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const rawId = req.query.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;

  if (idParam === undefined) {
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
          acquiredOn: holdings.acquiredOn,
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
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = holdingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { quantity, avgCostBasis, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (quantity !== undefined) updates.quantity = String(quantity);
    if (avgCostBasis !== undefined) updates.avgCostBasis = String(avgCostBasis);

    const [updated] = await db
      .update(holdings)
      .set(updates)
      .where(eq(holdings.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(holdings).where(eq(holdings.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
