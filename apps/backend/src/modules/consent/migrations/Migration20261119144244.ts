import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261119144244 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "data_subject_request" drop constraint if exists "data_subject_request_reference_unique";`);
    this.addSql(`create table if not exists "consent" ("id" text not null, "subject_type" text check ("subject_type" in ('customer', 'anonymous')) not null, "subject_ref" text not null, "purpose" text not null, "granted" boolean not null, "text_version" text not null, "channel" text check ("channel" in ('cookie_banner', 'register', 'account', 'checkout', 'other')) not null, "ip" text null, "user_agent" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "consent_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_consent_deleted_at" ON "consent" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_consent_subject_ref_purpose_created_at" ON "consent" ("subject_ref", "purpose", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "data_subject_request" ("id" text not null, "reference" text not null, "type" text check ("type" in ('info', 'export', 'correct', 'delete', 'object', 'other')) not null, "status" text check ("status" in ('received', 'verifying', 'in_progress', 'resolved', 'rejected')) not null default 'received', "full_name" text not null, "email" text not null, "customer_id" text null, "details" text null, "received_at" timestamptz not null, "due_at" timestamptz not null, "resolved_at" timestamptz null, "resolution_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "data_subject_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_data_subject_request_reference_unique" ON "data_subject_request" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_data_subject_request_deleted_at" ON "data_subject_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_data_subject_request_email" ON "data_subject_request" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_data_subject_request_status_due_at" ON "data_subject_request" ("status", "due_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "iys_sync" ("id" text not null, "channel" text check ("channel" in ('EPOSTA', 'MESAJ')) not null, "recipient" text not null, "status" text check ("status" in ('ONAY', 'RET')) not null, "source" text not null, "mode" text check ("mode" in ('mock', 'live')) not null, "synced_at" timestamptz not null, "response" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "iys_sync_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_iys_sync_deleted_at" ON "iys_sync" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "legal_acceptance" ("id" text not null, "cart_id" text not null, "order_id" text null, "doc_key" text not null, "doc_version" text not null, "doc_hash" text not null, "locale" text not null, "email" text null, "customer_id" text null, "accepted_at" timestamptz not null, "ip" text null, "user_agent" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "legal_acceptance_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_legal_acceptance_deleted_at" ON "legal_acceptance" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_legal_acceptance_cart_id" ON "legal_acceptance" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_legal_acceptance_order_id" ON "legal_acceptance" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "retention_log" ("id" text not null, "rule" text not null, "action" text check ("action" in ('delete', 'anonymize', 'destroy')) not null, "affected" integer not null, "ran_at" timestamptz not null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "retention_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_retention_log_deleted_at" ON "retention_log" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "consent" cascade;`);

    this.addSql(`drop table if exists "data_subject_request" cascade;`);

    this.addSql(`drop table if exists "iys_sync" cascade;`);

    this.addSql(`drop table if exists "legal_acceptance" cascade;`);

    this.addSql(`drop table if exists "retention_log" cascade;`);
  }

}
