import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119132841 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "price_history_entry" ("id" text not null, "variant_id" text not null, "currency_code" text not null, "amount" numeric not null, "valid_from" timestamptz not null, "valid_to" timestamptz null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_history_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_history_entry_deleted_at" ON "price_history_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_history_entry_variant_id_currency_code_valid_from" ON "price_history_entry" ("variant_id", "currency_code", "valid_from") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "price_history_entry" cascade;`);
  }

}
