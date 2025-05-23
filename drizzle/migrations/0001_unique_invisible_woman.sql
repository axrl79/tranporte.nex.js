CREATE TYPE "public"."vehicle_status" AS ENUM('disponible', 'en_ruta', 'mantenimiento', 'inactivo');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('camion', 'trailer', 'cisterna', 'furgon', 'otro');--> statement-breakpoint
CREATE TABLE "maintenances" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"cost" numeric,
	"technician_id" text,
	"status" varchar(50) DEFAULT 'programado' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"origin_name" varchar(255) NOT NULL,
	"origin_lat" numeric NOT NULL,
	"origin_lng" numeric NOT NULL,
	"destination_name" varchar(255) NOT NULL,
	"destination_lat" numeric NOT NULL,
	"destination_lng" numeric NOT NULL,
	"distance" numeric NOT NULL,
	"estimated_duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"speed" numeric,
	"heading" numeric,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"route_id" text NOT NULL,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"status" varchar(50) DEFAULT 'programado' NOT NULL,
	"cargo" text NOT NULL,
	"cargo_weight" numeric,
	"notes" text,
	"fuel_consumed" numeric,
	"km_traveled" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"plate_number" varchar(20) NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"capacity" numeric NOT NULL,
	"status" "vehicle_status" DEFAULT 'disponible' NOT NULL,
	"last_maintenance" timestamp,
	"next_maintenance" timestamp,
	"fuel_type" varchar(50) NOT NULL,
	"fuel_capacity" numeric NOT NULL,
	"current_fuel_level" numeric,
	"total_km" numeric DEFAULT '0' NOT NULL,
	"last_location_lat" numeric,
	"last_location_lng" numeric,
	"last_location_timestamp" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "vehicles_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_locations" ADD CONSTRAINT "trip_locations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;