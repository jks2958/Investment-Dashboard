CREATE TYPE "public"."asset_type" AS ENUM('stock', 'fund', 'crypto', 'cash');--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cash_accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"balance" numeric(18, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holdings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "holdings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"symbol" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"avg_cost_basis" numeric(18, 8) NOT NULL,
	"account" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_cache" (
	"symbol" text PRIMARY KEY NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"last_price" numeric(18, 8) NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
