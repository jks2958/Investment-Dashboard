CREATE TYPE "public"."commitment_category" AS ENUM('education', 'family', 'purchase', 'medical', 'travel', 'other');--> statement-breakpoint
CREATE TYPE "public"."commitment_certainty" AS ENUM('confirmed', 'likely', 'possible');--> statement-breakpoint
CREATE TYPE "public"."debt_kind" AS ENUM('mortgage', 'car', 'credit_card', 'student', 'personal', 'business', 'other');--> statement-breakpoint
CREATE TABLE "commitments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "commitments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"category" "commitment_category" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"due_on" date NOT NULL,
	"recurring_years" integer DEFAULT 1 NOT NULL,
	"certainty" "commitment_certainty" DEFAULT 'confirmed' NOT NULL,
	"funded_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "debts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"kind" "debt_kind" NOT NULL,
	"lender" text,
	"balance" numeric(18, 2) NOT NULL,
	"original_amount" numeric(18, 2),
	"interest_rate" numeric(6, 3),
	"monthly_payment" numeric(18, 2),
	"started_on" date,
	"payoff_target_on" date,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "net_worth_snapshots" ADD COLUMN "debt_total" numeric(18, 2) DEFAULT '0' NOT NULL;