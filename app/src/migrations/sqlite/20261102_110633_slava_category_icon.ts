import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`slava_name\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`slava_date\` text;`)
  await db.run(sql`ALTER TABLE \`link_categories\` ADD \`icon\` text DEFAULT 'folder';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`slava_name\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`slava_date\`;`)
  await db.run(sql`ALTER TABLE \`link_categories\` DROP COLUMN \`icon\`;`)
}
