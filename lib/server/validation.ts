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

export const otherAssetInsertSchema = z.object({
  name: z.string().trim().min(1).max(60),
  value: z.coerce.number().nonnegative(),
});

export const otherAssetUpdateSchema = otherAssetInsertSchema.partial();

export const transactionInsertSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(40),
  amount: z.coerce.number().positive(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  note: z.string().trim().max(200).optional(),
});

export const wishlistInsertSchema = z
  .object({
    symbol: z.string().trim().min(1).max(20),
    assetType: z.enum(["stock", "fund", "crypto"]),
    targetPrice: z.coerce.number().positive().optional(),
    note: z.string().trim().max(200).optional(),
  })
  .transform((data) => ({
    ...data,
    symbol: data.assetType === "crypto" ? data.symbol.toLowerCase() : data.symbol.toUpperCase(),
  }));

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const widgetTypeSchema = z.enum([
  "total-assets",
  "net-income",
  "expenses",
  "allocation",
  "mini-cash",
  "mini-stocks",
  "mini-funds",
  "mini-crypto",
  "cash-accounts",
  "other-assets",
  "wishlist",
  "transactions",
  "holdings-stocks",
  "holdings-funds",
  "holdings-crypto",
]);

export const widgetLayoutItemSchema = z.object({
  i: z.string().min(1).max(80),
  type: widgetTypeSchema,
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
  w: z.coerce.number().int().min(1),
  h: z.coerce.number().int().min(1),
});

export const accentSchema = z.enum(["orange", "blue", "emerald", "violet", "rose"]);

export const cardSkinSchema = z.enum(["gold", "platinum", "onyx", "sapphire", "rose-gold"]);

export const dashboardSettingsUpdateSchema = z.object({
  layoutLg: z.array(widgetLayoutItemSchema).max(60).optional(),
  layoutMd: z.array(widgetLayoutItemSchema).max(60).optional(),
  accent: accentSchema.optional(),
  cardSkin: cardSkinSchema.optional(),
  reset: z.boolean().optional(),
});
