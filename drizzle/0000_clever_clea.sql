CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"full_name" text,
	"phone_number" text,
	"avatar_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"product_name" text NOT NULL,
	"user_id" uuid,
	"status" text DEFAULT 'unused' NOT NULL,
	"max_activations" integer DEFAULT 1 NOT NULL,
	"current_activations" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "licenses_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;