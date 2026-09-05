ALTER TABLE "cash_accounts" ADD COLUMN "acquired_on" date;--> statement-breakpoint
ALTER TABLE "holdings" ADD COLUMN "acquired_on" date;--> statement-breakpoint
ALTER TABLE "other_assets" ADD COLUMN "acquired_on" date;