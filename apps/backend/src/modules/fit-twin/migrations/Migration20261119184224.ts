import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119184224 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "foot_profile" drop constraint if exists "foot_profile_customer_id_unique";`);
    this.addSql(`create table if not exists "foot_profile" ("id" text not null, "customer_id" text not null, "sealed" text not null, "consent_version" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "foot_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_foot_profile_customer_id_unique" ON "foot_profile" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_foot_profile_deleted_at" ON "foot_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "foot_profile" cascade;`);
  }

}
