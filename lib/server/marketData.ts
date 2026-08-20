import { inArray } from "drizzle-orm";

import { db } from "../../db/client";
import { holdings, priceCache } from "../../db/schema";

const STALE_MS = 15 * 60 * 1000;
const TWELVE_DATA_BASE = "https://api.twelvedata.com";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function fetchTwelveDataPrices(
  symbols: string[],
): Promise<Map<string, number>> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || symbols.length === 0) return new Map();

  const url = `${TWELVE_DATA_BASE}/price?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return new Map();

  const data = (await res.json()) as
    | { price?: string }
    | Record<string, { price?: string }>;

  const prices = new Map<string, number>();
  if (symbols.length === 1) {
    const price = Number((data as { price?: string }).price);
    if (Number.isFinite(price)) prices.set(symbols[0], price);
    return prices;
  }

  for (const symbol of symbols) {
    const entry = (data as Record<string, { price?: string }>)[symbol];
    const price = Number(entry?.price);
    if (Number.isFinite(price)) prices.set(symbol, price);
  }
  return prices;
}

async function fetchCoinGeckoPrices(
  ids: string[],
): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();

  const url = `${COINGECKO_BASE}/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) return new Map();

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const prices = new Map<string, number>();
  for (const id of ids) {
    const price = data[id]?.usd;
    if (typeof price === "number") prices.set(id, price);
  }
  return prices;
}

export async function refreshStalePrices(): Promise<void> {
  const rows = await db
    .selectDistinct({
      symbol: holdings.symbol,
      assetType: holdings.assetType,
    })
    .from(holdings);

  if (rows.length === 0) return;

  const symbols = rows.map((r) => r.symbol);
  const cached = await db
    .select({ symbol: priceCache.symbol, fetchedAt: priceCache.fetchedAt })
    .from(priceCache)
    .where(inArray(priceCache.symbol, symbols));

  const freshBySymbol = new Map(
    cached.map((c) => [c.symbol, Date.now() - c.fetchedAt.getTime() < STALE_MS]),
  );

  const stale = rows.filter((r) => !freshBySymbol.get(r.symbol));
  if (stale.length === 0) return;

  const stockSymbols = stale
    .filter((r) => r.assetType === "stock" || r.assetType === "fund")
    .map((r) => r.symbol);
  const cryptoSymbols = stale
    .filter((r) => r.assetType === "crypto")
    .map((r) => r.symbol);

  const [stockPrices, cryptoPrices] = await Promise.all([
    fetchTwelveDataPrices(stockSymbols),
    fetchCoinGeckoPrices(cryptoSymbols),
  ]);

  const assetTypeBySymbol = new Map(rows.map((r) => [r.symbol, r.assetType]));
  const updates = [...stockPrices, ...cryptoPrices];

  for (const [symbol, price] of updates) {
    const assetType = assetTypeBySymbol.get(symbol);
    if (!assetType) continue;
    await db
      .insert(priceCache)
      .values({ symbol, assetType, lastPrice: String(price), fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: priceCache.symbol,
        set: { lastPrice: String(price), fetchedAt: new Date() },
      });
  }
}
