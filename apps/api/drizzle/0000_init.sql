CREATE TYPE "public"."access_direction" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."access_source" AS ENUM('LPR', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."access_status" AS ENUM('PENDING', 'APPROVED', 'DENIED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."access_subject" AS ENUM('RESIDENT_VEHICLE', 'VISITOR_VEHICLE', 'BLOCKED_VEHICLE', 'UNKNOWN_VEHICLE', 'VISITOR', 'PERSON');--> statement-breakpoint
CREATE TYPE "public"."access_suggestion" AS ENUM('APPROVE', 'REVIEW', 'DENY');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('RECEIVED', 'PICKED_UP');--> statement-breakpoint
CREATE TYPE "public"."gate_driver" AS ENUM('SIMULATED', 'HTTP_RELAY');--> statement-breakpoint
CREATE TYPE "public"."gate_kind" AS ENUM('TURNSTILE', 'VEHICLE_GATE', 'DOOR');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('DELIVERY_RECEIVED', 'VISITOR_ARRIVED', 'VEHICLE_ENTERED', 'ACCESS_DENIED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'CONCIERGE', 'RESIDENT');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('ACTIVE', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('AUTHORIZED', 'INSIDE', 'LEFT', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "residents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"document" varchar(20),
	"phone" varchar(20),
	"email" varchar(160),
	"is_owner" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"block" varchar(20) DEFAULT '' NOT NULL,
	"number" varchar(20) NOT NULL,
	"floor" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"resident_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"resident_id" uuid,
	"plate" varchar(7) NOT NULL,
	"plate_key" varchar(7) NOT NULL,
	"brand" varchar(40),
	"model" varchar(60),
	"color" varchar(30),
	"status" "vehicle_status" DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"gate_id" uuid NOT NULL,
	"direction" "access_direction" DEFAULT 'IN' NOT NULL,
	"source" "access_source" NOT NULL,
	"plate_read" varchar(10),
	"plate_key" varchar(7),
	"confidence" real,
	"snapshot_url" text,
	"subject" "access_subject" NOT NULL,
	"suggestion" "access_suggestion" NOT NULL,
	"reason" text NOT NULL,
	"unit_id" uuid,
	"vehicle_id" uuid,
	"visitor_id" uuid,
	"status" "access_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"decided_by_id" uuid,
	"decided_at" timestamp with time zone,
	"decision_note" text
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"carrier" varchar(60) NOT NULL,
	"tracking_code" varchar(60),
	"description" text,
	"status" "delivery_status" DEFAULT 'RECEIVED' NOT NULL,
	"received_by_id" uuid,
	"picked_up_at" timestamp with time zone,
	"picked_up_by" varchar(120)
);
--> statement-breakpoint
CREATE TABLE "gates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(60) NOT NULL,
	"kind" "gate_kind" NOT NULL,
	"driver" "gate_driver" DEFAULT 'SIMULATED' NOT NULL,
	"endpoint" text,
	"device_key_hash" text,
	CONSTRAINT "gates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(120) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"document" varchar(20),
	"plate" varchar(7),
	"plate_key" varchar(7),
	"status" "visit_status" DEFAULT 'AUTHORIZED' NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"authorized_by_id" uuid,
	"entered_at" timestamp with time zone,
	"left_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_gate_id_gates_id_fk" FOREIGN KEY ("gate_id") REFERENCES "public"."gates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_decided_by_id_users_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_received_by_id_users_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_authorized_by_id_users_id_fk" FOREIGN KEY ("authorized_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "residents_unit_idx" ON "residents" USING btree ("unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "units_block_number_uq" ON "units" USING btree ("block","number");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_plate_key_uq" ON "vehicles" USING btree ("plate_key");--> statement-breakpoint
CREATE INDEX "vehicles_unit_idx" ON "vehicles" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "access_requests_status_idx" ON "access_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "access_requests_plate_key_idx" ON "access_requests" USING btree ("plate_key");--> statement-breakpoint
CREATE INDEX "deliveries_unit_status_idx" ON "deliveries" USING btree ("unit_id","status");--> statement-breakpoint
CREATE INDEX "notifications_unit_idx" ON "notifications" USING btree ("unit_id","created_at");--> statement-breakpoint
CREATE INDEX "visitors_unit_idx" ON "visitors" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "visitors_plate_key_idx" ON "visitors" USING btree ("plate_key");