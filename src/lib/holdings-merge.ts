import type { Holding } from "@/lib/api";

/**
 * Combining a new purchase with a position already held.
 *
 * A holding stores one average cost per row, so buying more of something meant
 * either recomputing the weighted average by hand or ending up with the symbol
 * listed twice — which then double-counts nothing but reads as two positions
 * everywhere it appears.
 */

export type MergePreview = {
  existing: Holding;
  /** Units after the purchase. */
  totalQuantity: number;
  /** Cost-weighted average, which is the whole point of doing this in code. */
  newAvgCost: number;
  previousAvgCost: number;
  addedQuantity: number;
  addedCost: number;
};

/** Same symbol and same asset type. Case-insensitive, since stock tickers are
 *  stored uppercase and CoinGecko ids lowercase. */
export function findExistingHolding(
  holdings: Holding[] | undefined,
  symbol: string,
  assetType: Holding["assetType"],
): Holding | undefined {
  const needle = symbol.trim().toLowerCase();
  if (!needle) return undefined;
  return (holdings ?? []).find(
    (h) => h.symbol.toLowerCase() === needle && h.assetType === assetType,
  );
}

export function previewMerge(
  existing: Holding,
  addedQuantity: number,
  addedUnitCost: number,
): MergePreview | undefined {
  const heldQuantity = Number(existing.quantity);
  const heldUnitCost = Number(existing.avgCostBasis);
  if (!Number.isFinite(heldQuantity) || !Number.isFinite(addedQuantity)) return undefined;

  const totalQuantity = heldQuantity + addedQuantity;
  if (totalQuantity <= 0) return undefined;

  const totalCost = heldQuantity * heldUnitCost + addedQuantity * addedUnitCost;

  return {
    existing,
    totalQuantity,
    newAvgCost: totalCost / totalQuantity,
    previousAvgCost: heldUnitCost,
    addedQuantity,
    addedCost: addedQuantity * addedUnitCost,
  };
}
