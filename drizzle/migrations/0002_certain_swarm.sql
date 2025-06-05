CREATE TYPE "public"."load_status" AS ENUM('pendiente', 'en_proceso', 'cargado', 'en_transito', 'descargado', 'completado');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('entrada', 'salida', 'ajuste', 'transferencia');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('liquido', 'solido', 'fragil', 'peligroso', 'perecedero', 'general');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'almacenista';--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"type" "movement_type" NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_cost" numeric,
	"total_cost" numeric,
	"reason" text NOT NULL,
	"reference" varchar(100),
	"user_id" text NOT NULL,
	"load_id" text,
	"previous_stock" numeric NOT NULL,
	"new_stock" numeric NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "load_checklists" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"description" text,
	"required" boolean DEFAULT true NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"completed_by" text,
	"notes" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "load_items" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"weight" numeric NOT NULL,
	"volume" numeric NOT NULL,
	"unit_value" numeric,
	"total_value" numeric,
	"loaded" boolean DEFAULT false NOT NULL,
	"unloaded" boolean DEFAULT false NOT NULL,
	"loaded_at" timestamp,
	"unloaded_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "loads" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"trip_id" text,
	"vehicle_id" text,
	"status" "load_status" DEFAULT 'pendiente' NOT NULL,
	"total_weight" numeric DEFAULT '0' NOT NULL,
	"total_volume" numeric DEFAULT '0' NOT NULL,
	"total_value" numeric DEFAULT '0' NOT NULL,
	"loading_date" timestamp,
	"unloading_date" timestamp,
	"loading_user_id" text,
	"unloading_user_id" text,
	"origin" varchar(255),
	"destination" varchar(255),
	"client" varchar(255),
	"notes" text,
	"qr_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loads_code_unique" UNIQUE("code"),
	CONSTRAINT "loads_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "product_type" NOT NULL,
	"unit" varchar(20) NOT NULL,
	"unit_weight" numeric,
	"unit_volume" numeric,
	"min_stock" numeric DEFAULT '0' NOT NULL,
	"max_stock" numeric,
	"current_stock" numeric DEFAULT '0' NOT NULL,
	"reserved_stock" numeric DEFAULT '0' NOT NULL,
	"available_stock" numeric DEFAULT '0' NOT NULL,
	"location" varchar(100),
	"qr_code" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code"),
	CONSTRAINT "products_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "qr_scans" (
	"id" text PRIMARY KEY NOT NULL,
	"qr_code" text NOT NULL,
	"scanned_by" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"location" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_load_id_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."loads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_checklists" ADD CONSTRAINT "load_checklists_load_id_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."loads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_checklists" ADD CONSTRAINT "load_checklists_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_items" ADD CONSTRAINT "load_items_load_id_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."loads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "load_items" ADD CONSTRAINT "load_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loads" ADD CONSTRAINT "loads_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loads" ADD CONSTRAINT "loads_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loads" ADD CONSTRAINT "loads_loading_user_id_users_id_fk" FOREIGN KEY ("loading_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loads" ADD CONSTRAINT "loads_unloading_user_id_users_id_fk" FOREIGN KEY ("unloading_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_scanned_by_users_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;