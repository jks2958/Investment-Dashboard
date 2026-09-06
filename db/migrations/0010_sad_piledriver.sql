CREATE TYPE "public"."currency" AS ENUM('USD', 'PKR');--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "commitments" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "other_assets" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "fx_rate" numeric(12, 4);