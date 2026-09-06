import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { cashAccounts, debts, holdings, otherAssets, priceCache } from "../../db/schema.js";
import { currentUsdPkrRate, toUsd } from "./money.js";

export type AssetTypeValues = {
  stock: number;
  fund: number;
  crypto: number;
  cash: number;
  other: number;
  debt: number;
  totalInvested: number;
};

export async function computeAssetTypeValues(): Promise<AssetTypeValues> {
  const rows = await db
    .select({
      assetType: holdings.assetType,
      quantity: holdings.quantity,
      avgCostBasis: holdings.avgCostBasis,
      lastPrice: priceCache.lastPrice,
    })
    .from(holdings)
    .leftJoin(priceCache, eq(holdings.symbol, priceCache.symbol));

  const values: AssetTypeValues = {
    stock: 0,
    fund: 0,
    crypto: 0,
    cash: 0,
    other: 0,
    debt: 0,
    totalInvested: 0,
  };

  for (const row of rows) {
    const quantity = Number(row.quantity);
    const price = row.lastPrice !== null ? Number(row.lastPrice) : Number(row.avgCostBasis);
    if (row.assetType === "stock" || row.assetType === "fund" || row.assetType === "crypto") {
      values[row.assetType] += quantity * price;
    }
    values.totalInvested += quantity * Number(row.avgCostBasis);
  }

  // Holdings are priced in USD by the market data providers, so only the
  // hand-entered balances below can carry a currency of their own.
  const rate = await currentUsdPkrRate();

  const cash = await db
    .select({ balance: cashAccounts.balance, currency: cashAccounts.currency })
    .from(cashAccounts);
  values.cash = cash.reduce((sum, c) => sum + toUsd(Number(c.balance), c.currency, rate), 0);

  const other = await db
    .select({ value: otherAssets.value, currency: otherAssets.currency })
    .from(otherAssets);
  values.other = other.reduce((sum, o) => sum + toUsd(Number(o.value), o.currency, rate), 0);

  const owed = await db.select({ balance: debts.balance, currency: debts.currency }).from(debts);
  values.debt = owed.reduce((sum, d) => sum + toUsd(Number(d.balance), d.currency, rate), 0);

  return values;
}
