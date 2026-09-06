CREATE TABLE "budgets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "budgets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category" text NOT NULL,
	"monthly_limit" numeric(18, 2) NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_category_unique" UNIQUE("category")
);
--> statement-breakpoint
ALTER TABLE "auth_config" ADD COLUMN "passphrase_salt" text;--> statement-breakpoint
ALTER TABLE "auth_config" ADD COLUMN "failed_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_config" ADD COLUMN "locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "auth_config" ADD COLUMN "session_epoch" integer DEFAULT 1 NOT NULL;