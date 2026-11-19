import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119132839 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "last" drop constraint if exists "last_code_unique";`);
    this.addSql(`create table if not exists "last" ("id" text not null, "code" text not null, "name" text not null, "category" text not null, "toe_shape" text check ("toe_shape" in ('round', 'almond', 'square', 'pointed')) not null, "size_table" jsonb not null, "notes" text null, "is_demo" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "last_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_last_code_unique" ON "last" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_last_deleted_at" ON "last" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "last" cascade;`);
  }

}
