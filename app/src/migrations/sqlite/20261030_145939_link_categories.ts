import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`link_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`link_categories_updated_at_idx\` ON \`link_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`link_categories_created_at_idx\` ON \`link_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`link_categories_locales\` (
  	\`title\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`link_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`link_categories_locales_locale_parent_id_unique\` ON \`link_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`link_categories_locales_parent_id_idx\` ON \`link_categories_locales\` (\`_parent_id\`);`)
  // SQLite cannot add a NOT NULL column without a default; Payload enforces `required` instead.
  await db.run(sql`ALTER TABLE \`links\` ADD \`category_id\` integer REFERENCES link_categories(id);`)
  await db.run(sql`CREATE INDEX \`links_category_idx\` ON \`links\` (\`category_id\`);`)
  // The fixed groups become editable categories (only those in use), and existing links move into them.
  const groups = [
    ['start', 1, 'Prvi koraci', 'Getting started', 'Erste Schritte'],
    ['people', 2, 'Zaposleni i beneficije', 'People & benefits', 'Personal & Benefits'],
    ['admin', 3, 'Svakodnevna administracija', 'Everyday admin', 'Alltag & Verwaltung'],
  ] as const
  for (const [group, order, sr, en, de] of groups) {
    const used = await db.get<{ n: number }>(sql`SELECT count(*) AS n FROM \`links\` WHERE \`group\` = ${group};`)
    if (!used?.n) continue
    const created = await db.get<{ id: number }>(sql`INSERT INTO \`link_categories\` (\`order\`) VALUES (${order}) RETURNING \`id\`;`)
    if (!created) continue
    for (const [locale, title] of [['sr', sr], ['en', en], ['de', de]]) {
      await db.run(sql`INSERT INTO \`link_categories_locales\` (\`title\`, \`_locale\`, \`_parent_id\`) VALUES (${title}, ${locale}, ${created.id});`)
    }
    await db.run(sql`UPDATE \`links\` SET \`category_id\` = ${created.id} WHERE \`group\` = ${group};`)
  }
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`link_categories_id\` integer REFERENCES link_categories(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_link_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`link_categories_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`link_categories\`;`)
  await db.run(sql`DROP TABLE \`link_categories_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`url\` text DEFAULT '#' NOT NULL,
  	\`group\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`tile\` text,
  	\`icon\` text DEFAULT 'doc',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_links\`("id", "url", "group", "order", "tile", "icon", "updated_at", "created_at") SELECT "id", "url", "group", "order", "tile", "icon", "updated_at", "created_at" FROM \`links\`;`)
  await db.run(sql`DROP TABLE \`links\`;`)
  await db.run(sql`ALTER TABLE \`__new_links\` RENAME TO \`links\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`links_updated_at_idx\` ON \`links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`links_created_at_idx\` ON \`links\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`events_id\` integer,
  	\`users_id\` integer,
  	\`links_id\` integer,
  	\`classifieds_id\` integer,
  	\`jobs_id\` integer,
  	\`rec_posts_id\` integer,
  	\`rec_comments_id\` integer,
  	\`rec_categories_id\` integer,
  	\`polls_id\` integer,
  	\`poll_votes_id\` integer,
  	\`albums_id\` integer,
  	\`chat_messages_id\` integer,
  	\`departments_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`classifieds_id\`) REFERENCES \`classifieds\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`jobs_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rec_posts_id\`) REFERENCES \`rec_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rec_comments_id\`) REFERENCES \`rec_comments\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rec_categories_id\`) REFERENCES \`rec_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`polls_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`poll_votes_id\`) REFERENCES \`poll_votes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`albums_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chat_messages_id\`) REFERENCES \`chat_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`departments_id\`) REFERENCES \`departments\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "events_id", "users_id", "links_id", "classifieds_id", "jobs_id", "rec_posts_id", "rec_comments_id", "rec_categories_id", "polls_id", "poll_votes_id", "albums_id", "chat_messages_id", "departments_id", "media_id") SELECT "id", "order", "parent_id", "path", "events_id", "users_id", "links_id", "classifieds_id", "jobs_id", "rec_posts_id", "rec_comments_id", "rec_categories_id", "polls_id", "poll_votes_id", "albums_id", "chat_messages_id", "departments_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_links_id_idx\` ON \`payload_locked_documents_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_classifieds_id_idx\` ON \`payload_locked_documents_rels\` (\`classifieds_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`jobs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rec_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`rec_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rec_comments_id_idx\` ON \`payload_locked_documents_rels\` (\`rec_comments_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rec_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`rec_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_polls_id_idx\` ON \`payload_locked_documents_rels\` (\`polls_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_poll_votes_id_idx\` ON \`payload_locked_documents_rels\` (\`poll_votes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chat_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`chat_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_departments_id_idx\` ON \`payload_locked_documents_rels\` (\`departments_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
