CREATE TABLE "dashboard_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"layout_lg" jsonb NOT NULL,
	"layout_md" jsonb NOT NULL,
	"accent" text DEFAULT 'orange' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
