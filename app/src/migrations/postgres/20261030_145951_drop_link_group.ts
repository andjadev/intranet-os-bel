import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "links" DROP COLUMN "group";
  DROP TYPE "public"."enum_links_group";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_links_group" AS ENUM('start', 'people', 'admin');
  ALTER TABLE "links" ADD COLUMN "group" "enum_links_group" NOT NULL;`)
}
