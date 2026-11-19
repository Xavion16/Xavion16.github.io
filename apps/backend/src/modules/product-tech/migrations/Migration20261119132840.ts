import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119132840 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_tech" ("id" text not null, "last_code" text not null, "construction" text check ("construction" in ('cemented', 'goodyear_welt', 'blake', 'vulcanized')) not null, "heel" jsonb null, "boot" jsonb null, "materials" jsonb not null, "weight_grams_pair" integer not null, "repairability_score" integer not null, "test_metrics" jsonb not null, "is_made_to_order" boolean not null default false, "lead_time_days" integer null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_tech_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_tech_deleted_at" ON "product_tech" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_tech" cascade;`);
  }

}
