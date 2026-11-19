import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119172812 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "support_ticket" drop constraint if exists "support_ticket_ticket_no_unique";`);
    this.addSql(`alter table if exists "return_request" drop constraint if exists "return_request_return_no_unique";`);
    this.addSql(`create table if not exists "fit_feedback" ("id" text not null, "product_handle" text not null, "variant_title" text not null, "result" text check ("result" in ('small', 'large', 'narrow', 'wide', 'other')) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "fit_feedback_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_fit_feedback_deleted_at" ON "fit_feedback" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "return_request" ("id" text not null, "return_no" text not null, "order_id" text not null, "order_display_id" integer not null, "email" text not null, "items" jsonb not null, "reason" text check ("reason" in ('fit', 'dislike', 'defective', 'wrong_item')) not null, "path" text check ("path" in ('withdrawal', 'defect', 'exchange')) not null, "defect_remedy" text check ("defect_remedy" in ('terminate', 'discount', 'repair', 'replace')) null, "exchange_note" text null, "within_withdrawal" boolean not null, "delivered_at" timestamptz not null, "withdrawal_deadline" timestamptz not null, "return_code" text not null, "status" text check ("status" in ('requested', 'in_transit', 'received', 'refunded', 'rejected')) not null default 'requested', "refund_due_at" timestamptz null, "refunded_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "return_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_return_request_return_no_unique" ON "return_request" ("return_no") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_return_request_deleted_at" ON "return_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_return_request_order_id" ON "return_request" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_return_request_status_refund_due_at" ON "return_request" ("status", "refund_due_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_ticket" ("id" text not null, "ticket_no" text not null, "channel" text check ("channel" in ('form', 'chat', 'email', 'phone')) not null, "topic" text check ("topic" in ('size_fit', 'order', 'shipping', 'return', 'payment', 'care', 'kvkk', 'other')) not null, "message" text not null, "full_name" text not null, "email" text not null, "customer_id" text null, "order_ref" text null, "status" text check ("status" in ('open', 'pending', 'resolved')) not null default 'open', "transcript" jsonb null, "external_ref" text null, "first_response_at" timestamptz null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_ticket_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_ticket_ticket_no_unique" ON "support_ticket" ("ticket_no") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_deleted_at" ON "support_ticket" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_status_created_at" ON "support_ticket" ("status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_email" ON "support_ticket" ("email") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "fit_feedback" cascade;`);

    this.addSql(`drop table if exists "return_request" cascade;`);

    this.addSql(`drop table if exists "support_ticket" cascade;`);
  }

}
