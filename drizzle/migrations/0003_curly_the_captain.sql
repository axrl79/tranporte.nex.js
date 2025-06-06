CREATE TYPE "public"."attendance_type" AS ENUM('entrada', 'salida', 'descanso_inicio', 'descanso_fin');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('servicio', 'kilometraje', 'peso', 'tiempo', 'mixto');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('licencia', 'cedula', 'pasaporte', 'certificado', 'contrato', 'otro');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('activo', 'inactivo', 'vacaciones', 'licencia', 'suspendido');--> statement-breakpoint
CREATE TYPE "public"."employee_type" AS ENUM('conductor', 'mecanico', 'administrativo', 'supervisor', 'gerente');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('borrador', 'enviada', 'pagada', 'vencida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pendiente', 'procesando', 'completado', 'fallido');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"type" "attendance_type" NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"location" varchar(255),
	"latitude" numeric,
	"longitude" numeric,
	"notes" text,
	"verified_by" text,
	"trip_id" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"business_name" varchar(255),
	"tax_id" varchar(50),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100) DEFAULT 'Bolivia',
	"contact_person" varchar(255),
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"credit_limit" numeric DEFAULT '0',
	"current_balance" numeric DEFAULT '0',
	"payment_terms" integer DEFAULT 30,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_code_unique" UNIQUE("code"),
	CONSTRAINT "clients_tax_id_unique" UNIQUE("tax_id")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"client_id" text NOT NULL,
	"type" "contract_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"base_rate" numeric NOT NULL,
	"km_rate" numeric,
	"weight_rate" numeric,
	"time_rate" numeric,
	"minimum_charge" numeric,
	"currency" varchar(10) DEFAULT 'BOB',
	"terms" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "driver_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"period" varchar(20) NOT NULL,
	"total_trips" integer DEFAULT 0,
	"completed_trips" integer DEFAULT 0,
	"cancelled_trips" integer DEFAULT 0,
	"total_km" numeric DEFAULT '0',
	"total_hours" numeric DEFAULT '0',
	"fuel_efficiency" numeric,
	"on_time_deliveries" integer DEFAULT 0,
	"late_deliveries" integer DEFAULT 0,
	"incidents_count" integer DEFAULT 0,
	"customer_rating" numeric,
	"rest_days" integer DEFAULT 0,
	"overtime_hours" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"type" "document_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"number" varchar(100),
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"issuing_authority" varchar(255),
	"file_url" text,
	"verified" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"user_id" text,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"birth_date" timestamp,
	"hire_date" timestamp NOT NULL,
	"termination_date" timestamp,
	"type" "employee_type" NOT NULL,
	"status" "employee_status" DEFAULT 'activo' NOT NULL,
	"position" varchar(100) NOT NULL,
	"department" varchar(100),
	"salary" numeric,
	"emergency_contact" varchar(255),
	"emergency_phone" varchar(50),
	"notes" text,
	"photo" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_price" numeric NOT NULL,
	"tax_rate" numeric DEFAULT '0',
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"number" varchar(50) NOT NULL,
	"client_id" text NOT NULL,
	"contract_id" text,
	"trip_id" text,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" "invoice_status" DEFAULT 'borrador' NOT NULL,
	"subtotal" numeric NOT NULL,
	"tax_amount" numeric DEFAULT '0',
	"discount_amount" numeric DEFAULT '0',
	"total_amount" numeric NOT NULL,
	"currency" varchar(10) DEFAULT 'BOB',
	"notes" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"client_id" text NOT NULL,
	"invoice_id" text,
	"type" "payment_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pendiente' NOT NULL,
	"amount" numeric NOT NULL,
	"currency" varchar(10) DEFAULT 'BOB',
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"reference" varchar(100),
	"notes" text,
	"processed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "performance_evaluations" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"evaluator_id" text NOT NULL,
	"period" varchar(50) NOT NULL,
	"evaluation_date" timestamp DEFAULT now() NOT NULL,
	"punctuality_score" integer,
	"safety_score" integer,
	"efficiency_score" integer,
	"customer_service_score" integer,
	"overall_score" numeric,
	"strengths" text,
	"areas_for_improvement" text,
	"goals" text,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"break_duration" integer DEFAULT 0,
	"total_hours" numeric,
	"overtime_hours" numeric DEFAULT '0',
	"status" varchar(50) DEFAULT 'programado',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_stats" ADD CONSTRAINT "driver_stats_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_evaluator_id_users_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;