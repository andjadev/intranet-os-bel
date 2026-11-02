import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
// Hand-edited: existing links have no file_id yet, and category_id stays nullable as in 20261030_145939_link_categories.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`documents_updated_at_idx\` ON \`documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`documents_created_at_idx\` ON \`documents\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`documents_filename_idx\` ON \`documents\` (\`filename\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`url\` text,
  	\`category_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`tile\` text,
  	\`icon\` text DEFAULT 'doc',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`documents\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`link_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_links\`("id", "file_id", "url", "category_id", "order", "tile", "icon", "updated_at", "created_at") SELECT "id", NULL, "url", "category_id", "order", "tile", "icon", "updated_at", "created_at" FROM \`links\`;`)
  await db.run(sql`DROP TABLE \`links\`;`)
  await db.run(sql`ALTER TABLE \`__new_links\` RENAME TO \`links\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`links_file_idx\` ON \`links\` (\`file_id\`);`)
  await db.run(sql`CREATE INDEX \`links_category_idx\` ON \`links\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`links_updated_at_idx\` ON \`links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`links_created_at_idx\` ON \`links\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`documents_id\` integer REFERENCES documents(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_documents_id_idx\` ON \`payload_locked_documents_rels\` (\`documents_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`documents\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`url\` text DEFAULT '#' NOT NULL,
  	\`category_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`tile\` text,
  	\`icon\` text DEFAULT 'doc',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`link_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_links\`("id", "url", "category_id", "order", "tile", "icon", "updated_at", "created_at") SELECT "id", COALESCE("url", '#'), "category_id", "order", "tile", "icon", "updated_at", "created_at" FROM \`links\`;`)
  await db.run(sql`DROP TABLE \`links\`;`)
  await db.run(sql`ALTER TABLE \`__new_links\` RENAME TO \`links\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`links_category_idx\` ON \`links\` (\`category_id\`);`)
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
  	\`link_categories_id\` integer,
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
  	FOREIGN KEY (\`link_categories_id\`) REFERENCES \`link_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
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
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "events_id", "users_id", "links_id", "link_categories_id", "classifieds_id", "jobs_id", "rec_posts_id", "rec_comments_id", "rec_categories_id", "polls_id", "poll_votes_id", "albums_id", "chat_messages_id", "departments_id", "media_id") SELECT "id", "order", "parent_id", "path", "events_id", "users_id", "links_id", "link_categories_id", "classifieds_id", "jobs_id", "rec_posts_id", "rec_comments_id", "rec_categories_id", "polls_id", "poll_votes_id", "albums_id", "chat_messages_id", "departments_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_links_id_idx\` ON \`payload_locked_documents_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_link_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`link_categories_id\`);`)
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
