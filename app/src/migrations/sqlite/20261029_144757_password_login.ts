import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`must_change_password\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`sessions_valid_after\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_token\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_expiration\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`salt\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`hash\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_requested_at\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`login_attempts\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`lock_until\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_1_idx\` ON \`users\` (\`email\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`users_email_1_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`must_change_password\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`sessions_valid_after\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_token\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_expiration\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`salt\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`hash\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_requested_at\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`login_attempts\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`lock_until\`;`)
}
