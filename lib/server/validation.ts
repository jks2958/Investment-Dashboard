import { z } from "zod";

export const holdingInsertSchema = z
  .object({
    symbol: z.string().trim().min(1).max(20),
    assetType: z.enum(["stock", "fund", "crypto"]),
    quantity: z.coerce.number().positive(),
    avgCostBasis: z.coerce.number().nonnegative(),
    account: z.string().trim().max(60).optional(),
  })
  .transform((data) => ({
    ...data,
    symbol: data.assetType === "crypto" ? data.symbol.toLowerCase() : data.symbol.toUpperCase(),
  }));

export const holdingUpdateSchema = z
  .object({
    symbol: z.string().trim().min(1).max(20).optional(),
    assetType: z.enum(["stock", "fund", "crypto"]).optional(),
    quantity: z.coerce.number().positive().optional(),
    avgCostBasis: z.coerce.number().nonnegative().optional(),
    account: z.string().trim().max(60).optional(),
  })
  .transform((data) => ({
    ...data,
    symbol:
      data.symbol === undefined
        ? undefined
        : data.assetType === "crypto"
          ? data.symbol.toLowerCase()
          : data.symbol.toUpperCase(),
  }));

export const cashInsertSchema = z.object({
  name: z.string().trim().min(1).max(60),
  balance: z.coerce.number().nonnegative(),
});

export const cashUpdateSchema = cashInsertSchema.partial();
