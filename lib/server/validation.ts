import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const holdingInsertSchema = z
  .object({
    symbol: z.string().trim().min(1).max(20),
    assetType: z.enum(["stock", "fund", "crypto"]),
    quantity: z.coerce.number().positive(),
    avgCostBasis: z.coerce.number().nonnegative(),
    account: z.string().trim().max(60).optional(),
    acquiredOn: isoDate.optional(),
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
    acquiredOn: isoDate.optional(),
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
  acquiredOn: isoDate.optional(),
});

export const cashUpdateSchema = cashInsertSchema.partial();

export const otherAssetInsertSchema = z.object({
  name: z.string().trim().min(1).max(60),
  value: z.coerce.number().nonnegative(),
  acquiredOn: isoDate.optional(),
});

export const otherAssetUpdateSchema = otherAssetInsertSchema.partial();

export const transactionInsertSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(40),
  amount: z.coerce.number().positive(),
  occurredOn: isoDate,
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

/** A backfilled net-worth row. totalInvested isn't asked for — nothing reads
 *  it back, so manual entries record it as 0. */
export const snapshotEntrySchema = z.object({
  snapshotDate: isoDate,
  cashValue: z.coerce.number().nonnegative(),
  stockValue: z.coerce.number().nonnegative(),
  fundValue: z.coerce.number().nonnegative(),
  cryptoValue: z.coerce.number().nonnegative(),
  otherValue: z.coerce.number().nonnegative(),
  debtTotal: z.coerce.number().nonnegative(),
});

export const snapshotBulkSchema = z.array(snapshotEntrySchema).min(1).max(400);

const optionalMoney = z.coerce.number().nonnegative().optional();

export const debtInsertSchema = z.object({
  name: z.string().trim().min(1).max(60),
  kind: z.enum(["mortgage", "car", "credit_card", "student", "personal", "business", "other"]),
  lender: z.string().trim().max(60).optional(),
  balance: z.coerce.number().nonnegative(),
  originalAmount: optionalMoney,
  interestRate: z.coerce.number().min(0).max(200).optional(),
  monthlyPayment: optionalMoney,
  startedOn: isoDate.optional(),
  payoffTargetOn: isoDate.optional(),
  note: z.string().trim().max(200).optional(),
});

export const debtUpdateSchema = debtInsertSchema.partial();

export const commitmentInsertSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(["education", "family", "purchase", "medical", "travel", "other"]),
  amount: z.coerce.number().positive(),
  dueOn: isoDate,
  recurringYears: z.coerce.number().int().min(1).max(50).optional(),
  certainty: z.enum(["confirmed", "likely", "possible"]).optional(),
  fundedAmount: optionalMoney,
  note: z.string().trim().max(200).optional(),
});

export const commitmentUpdateSchema = commitmentInsertSchema.partial();

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
  "net-worth-trend",
  "gainers-losers",
  "cash-runway",
  "wishlist-targets",
  "allocation-drift",
  "debts",
  "commitments",
]);

export const widgetLayoutItemSchema = z.object({
  i: z.string().min(1).max(80),
  type: widgetTypeSchema,
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
  w: z.coerce.number().int().min(1),
  h: z.coerce.number().int().min(1),
});

export const accentSchema = z.enum([
  "forest",
  "orange",
  "blue",
  "emerald",
  "violet",
  "rose",
]);

export const cardSkinSchema = z.enum([
  "forest",
  "gold",
  "platinum",
  "onyx",
  "sapphire",
  "rose-gold",
]);

const percent = z.coerce.number().min(0).max(100);

export const allocationTargetsSchema = z
  .object({
    stock: percent,
    fund: percent,
    crypto: percent,
    cash: percent,
    other: percent,
  })
  .refine(
    (t) => t.stock + t.fund + t.crypto + t.cash + t.other <= 100.001,
    "Target allocation cannot add up to more than 100%",
  );

export const dashboardSettingsUpdateSchema = z.object({
  layoutLg: z.array(widgetLayoutItemSchema).max(60).optional(),
  layoutMd: z.array(widgetLayoutItemSchema).max(60).optional(),
  accent: accentSchema.optional(),
  cardSkin: cardSkinSchema.optional(),
  targets: allocationTargetsSchema.optional(),
  reset: z.boolean().optional(),
});
