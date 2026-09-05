import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export type WidgetLayoutItem = {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Target portfolio mix, as percentages. All zeroes means "not configured". */
export type AllocationTargets = {
  stock: number;
  fund: number;
  crypto: number;
  cash: number;
  other: number;
};

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

export const debtKindEnum = pgEnum("debt_kind", [
  "mortgage",
  "car",
  "credit_card",
  "student",
  "personal",
  "business",
  "other",
]);

export const commitmentCategoryEnum = pgEnum("commitment_category", [
  "education",
  "family",
  "purchase",
  "medical",
  "travel",
  "other",
]);

/** How sure this future cost is, so "tuition due Sept 2032" and "maybe a new
 *  car someday" don't carry equal weight in the totals. */
export const commitmentCertaintyEnum = pgEnum("commitment_certainty", [
  "confirmed",
  "likely",
  "possible",
]);

// acquiredOn is the user-supplied date the asset was actually acquired (or the
// account opened), so assets can be entered retrospectively. Nullable: rows
// created before this existed have no date, and it stays optional.
export const cashAccounts = pgTable("cash_accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull(),
  acquiredOn: date("acquired_on"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const otherAssets = pgTable("other_assets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  value: numeric("value", { precision: 18, scale: 2 }).notNull(),
  acquiredOn: date("acquired_on"),
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
  acquiredOn: date("acquired_on"),
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
  otherValue: numeric("other_value", { precision: 18, scale: 2 }).notNull().default("0"),
  debtTotal: numeric("debt_total", { precision: 18, scale: 2 }).notNull().default("0"),
  totalInvested: numeric("total_invested", {
    precision: 18,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Money owed now. Subtracts from net worth. */
export const debts = pgTable("debts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  kind: debtKindEnum("kind").notNull(),
  lender: text("lender"),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull(),
  originalAmount: numeric("original_amount", { precision: 18, scale: 2 }),
  interestRate: numeric("interest_rate", { precision: 6, scale: 3 }),
  monthlyPayment: numeric("monthly_payment", { precision: 18, scale: 2 }),
  startedOn: date("started_on"),
  payoffTargetOn: date("payoff_target_on"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Money you'll need later but don't owe anyone yet. Deliberately kept out of
 *  the net worth maths — a future cost isn't a present liability. */
export const commitments = pgTable("commitments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: commitmentCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  dueOn: date("due_on").notNull(),
  /** Repeats annually this many times from dueOn — 4 years of tuition is one row. */
  recurringYears: integer("recurring_years").notNull().default(1),
  certainty: commitmentCertaintyEnum("certainty").notNull().default("confirmed"),
  fundedAmount: numeric("funded_amount", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  note: text("note"),
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

export const dashboardSettings = pgTable("dashboard_settings", {
  id: integer("id").primaryKey(),
  layoutLg: jsonb("layout_lg").$type<WidgetLayoutItem[]>().notNull(),
  layoutMd: jsonb("layout_md").$type<WidgetLayoutItem[]>().notNull(),
  accent: text("accent").notNull().default("orange"),
  cardSkin: text("card_skin").notNull().default("gold"),
  targets: jsonb("targets")
    .$type<AllocationTargets>()
    .notNull()
    .default({ stock: 0, fund: 0, crypto: 0, cash: 0, other: 0 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
