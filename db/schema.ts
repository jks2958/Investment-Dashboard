import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const assetTypeEnum = pgEnum("asset_type", [
  "stock",
  "fund",
  "crypto",
  "cash",
]);

export const cashAccounts = pgTable("cash_accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const holdings = pgTable("holdings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  symbol: text("symbol").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  quantity: numeric("quantity", { precision: 24, scale: 8 }).notNull(),
  avgCostBasis: numeric("avg_cost_basis", {
    precision: 18,
    scale: 8,
  }).notNull(),
  account: text("account"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceCache = pgTable("price_cache", {
  symbol: text("symbol").primaryKey(),
  assetType: assetTypeEnum("asset_type").notNull(),
  lastPrice: numeric("last_price", { precision: 18, scale: 8 }).notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});
