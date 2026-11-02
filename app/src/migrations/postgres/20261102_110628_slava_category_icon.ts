import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_link_categories_icon" AS ENUM('vpn', 'health', 'vacation', 'alert', 'card', 'doc', 'info', 'folder', 'home', 'chat', 'wrench', 'star');
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'info';
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'folder';
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'home';
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'chat';
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'wrench';
  ALTER TYPE "public"."enum_links_icon" ADD VALUE 'star';
  ALTER TABLE "users" ADD COLUMN "slava_name" varchar;
  ALTER TABLE "users" ADD COLUMN "slava_date" timestamp(3) with time zone;
  ALTER TABLE "link_categories" ADD COLUMN "icon" "enum_link_categories_icon" DEFAULT 'folder';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "links" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "links" ALTER COLUMN "icon" SET DEFAULT 'doc'::text;
  DROP TYPE "public"."enum_links_icon";
  CREATE TYPE "public"."enum_links_icon" AS ENUM('vpn', 'health', 'vacation', 'alert', 'card', 'doc');
  ALTER TABLE "links" ALTER COLUMN "icon" SET DEFAULT 'doc'::"public"."enum_links_icon";
  ALTER TABLE "links" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_links_icon" USING "icon"::"public"."enum_links_icon";
  ALTER TABLE "users" DROP COLUMN "slava_name";
  ALTER TABLE "users" DROP COLUMN "slava_date";
  ALTER TABLE "link_categories" DROP COLUMN "icon";
  DROP TYPE "public"."enum_link_categories_icon";`)
}
