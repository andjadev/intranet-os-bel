import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "link_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "link_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "links" ADD COLUMN "category_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "link_categories_id" integer;
  ALTER TABLE "link_categories_locales" ADD CONSTRAINT "link_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."link_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "link_categories_updated_at_idx" ON "link_categories" USING btree ("updated_at");
  CREATE INDEX "link_categories_created_at_idx" ON "link_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "link_categories_locales_locale_parent_id_unique" ON "link_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "link_categories_locales_parent_id_idx" ON "link_categories_locales" USING btree ("_parent_id");
  ALTER TABLE "links" ADD CONSTRAINT "links_category_id_link_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."link_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_link_categories_fk" FOREIGN KEY ("link_categories_id") REFERENCES "public"."link_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "links_category_idx" ON "links" USING btree ("category_id");
  CREATE INDEX "payload_locked_documents_rels_link_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("link_categories_id");`)

  // The fixed groups become editable categories (only those in use), and existing links move into them.
  await db.execute(sql`
  DO $$
  DECLARE
    g record;
    cid integer;
  BEGIN
    FOR g IN SELECT * FROM (VALUES
      ('start', 1, 'Prvi koraci', 'Getting started', 'Erste Schritte'),
      ('people', 2, 'Zaposleni i beneficije', 'People & benefits', 'Personal & Benefits'),
      ('admin', 3, 'Svakodnevna administracija', 'Everyday admin', 'Alltag & Verwaltung')
    ) AS v(grp, ord, sr, en, de)
    LOOP
      CONTINUE WHEN NOT EXISTS (SELECT 1 FROM "links" WHERE "group"::text = g.grp);
      INSERT INTO "link_categories" ("order") VALUES (g.ord) RETURNING "id" INTO cid;
      INSERT INTO "link_categories_locales" ("title", "_locale", "_parent_id")
        VALUES (g.sr, 'sr', cid), (g.en, 'en', cid), (g.de, 'de', cid);
      UPDATE "links" SET "category_id" = cid WHERE "group"::text = g.grp;
    END LOOP;
  END $$;
  ALTER TABLE "links" ALTER COLUMN "category_id" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "link_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "link_categories_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "link_categories" CASCADE;
  DROP TABLE "link_categories_locales" CASCADE;
  ALTER TABLE "links" DROP CONSTRAINT "links_category_id_link_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_link_categories_fk";
  
  DROP INDEX "links_category_idx";
  DROP INDEX "payload_locked_documents_rels_link_categories_id_idx";
  ALTER TABLE "links" DROP COLUMN "category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "link_categories_id";`)
}
