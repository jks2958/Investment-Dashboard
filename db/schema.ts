import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const assetTypeEnum = pgEnum("asset_type", [
  "stock",
  "fund",
  "crypto",
  "cash",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
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

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: transactionTypeEnum("type").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  occurredOn: date("occurred_on").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  symbol: text("symbol").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  targetPrice: numeric("target_price", { precision: 18, scale: 8 }),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const netWorthSnapshots = pgTable("net_worth_snapshots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  snapshotDate: date("snapshot_date").notNull().unique(),
  cashValue: numeric("cash_value", { precision: 18, scale: 2 }).notNull(),
  stockValue: numeric("stock_value", { precision: 18, scale: 2 }).notNull(),
  fundValue: numeric("fund_value", { precision: 18, scale: 2 }).notNull(),
  cryptoValue: numeric("crypto_value", { precision: 18, scale: 2 }).notNull(),
  totalInvested: numeric("total_invested", {
    precision: 18,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const profile = pgTable("profile", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authConfig = pgTable("auth_config", {
  id: integer("id").primaryKey(),
  passphraseHash: text("passphrase_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
