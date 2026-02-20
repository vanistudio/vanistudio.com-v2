CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"content" text,
	"thumbnail" text,
	"cover_image" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"video_url" text,
	"live_url" text,
	"source_url" text,
	"figma_url" text,
	"category" text,
	"tech_stack" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"type" text DEFAULT 'personal' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"is_ongoing" boolean DEFAULT false NOT NULL,
	"author_id" uuid,
	"client_name" text,
	"role" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"content" text,
	"icon" text,
	"thumbnail" text,
	"cover_image" text,
	"price" numeric(12, 0) DEFAULT '0' NOT NULL,
	"min_price" numeric(12, 0),
	"max_price" numeric(12, 0),
	"currency" text DEFAULT 'VND' NOT NULL,
	"price_unit" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"category_id" uuid,
	"features" jsonb DEFAULT '[]'::jsonb,
	"deliverables" jsonb DEFAULT '[]'::jsonb,
	"estimated_days" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "licenses" RENAME COLUMN "current_activations" TO "domain";--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_avatar" text;--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" DROP COLUMN "max_activations";