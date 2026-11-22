import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119184232 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "repair_order" drop constraint if exists "repair_order_reference_unique";`);
    this.addSql(`alter table if exists "passport" drop constraint if exists "passport_code_unique";`);
    this.addSql(`create table if not exists "craftsman" ("id" text not null, "name" text not null, "specialty" text not null, "bio" jsonb not null, "since_year" integer not null, "is_demo" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "craftsman_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_craftsman_deleted_at" ON "craftsman" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "passport" ("id" text not null, "code" text not null, "product_id" text not null, "product_handle" text not null, "variant_id" text null, "variant_options" jsonb not null, "last_code" text not null, "craftsman_id" text not null, "produced_at" timestamptz not null, "batch" text null, "dpp" jsonb null, "is_demo" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "passport_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_passport_code_unique" ON "passport" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_passport_deleted_at" ON "passport" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_passport_product_id" ON "passport" ("product_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "repair_order" ("id" text not null, "reference" text not null, "passport_code" text null, "customer_id" text null, "full_name" text not null, "email" text not null, "type" text check ("type" in ('resole', 'heel', 'stitch', 'clean', 'recraft')) not null, "description" text not null, "photos" jsonb not null, "status" text check ("status" in ('received', 'in_repair', 'completed', 'cancelled')) not null default 'received', "quote_min" integer not null, "quote_max" integer not null, "credit_amount" integer null, "shipping_code" text not null, "public_note" text null, "completed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_repair_order_reference_unique" ON "repair_order" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_order_deleted_at" ON "repair_order" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_order_passport_code" ON "repair_order" ("passport_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_order_email" ON "repair_order" ("email") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "craftsman" cascade;`);

    this.addSql(`drop table if exists "passport" cascade;`);

    this.addSql(`drop table if exists "repair_order" cascade;`);
  }

}
