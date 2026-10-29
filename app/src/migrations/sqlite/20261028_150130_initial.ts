import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`date\` text NOT NULL,
  	\`time\` text,
  	\`type\` text DEFAULT 'event' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`events_date_idx\` ON \`events\` (\`date\`);`)
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`events_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`events_locales_locale_parent_id_unique\` ON \`events_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`events_locales_parent_id_idx\` ON \`events_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`first_name\` text,
  	\`initials\` text,
  	\`role\` text DEFAULT 'employee' NOT NULL,
  	\`active\` integer DEFAULT true,
  	\`entra_id\` text,
  	\`avatar_id\` integer,
  	\`department_id\` integer,
  	\`office\` text DEFAULT 'Beograd',
  	\`phone\` text,
  	\`start_date\` text,
  	\`birthday\` text,
  	\`is_newcomer\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`users_entra_id_idx\` ON \`users\` (\`entra_id\`);`)
  await db.run(sql`CREATE INDEX \`users_avatar_idx\` ON \`users\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`users_department_idx\` ON \`users\` (\`department_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_locales\` (
  	\`job_title\` text,
  	\`newcomer_note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`users_locales_locale_parent_id_unique\` ON \`users_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_locales_parent_id_idx\` ON \`users_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	\`locale\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_texts_order_parent\` ON \`users_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_texts_locale_parent\` ON \`users_texts\` (\`locale\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`links\` (
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
  await db.run(sql`CREATE INDEX \`links_updated_at_idx\` ON \`links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`links_created_at_idx\` ON \`links\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`links_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`links_locales_locale_parent_id_unique\` ON \`links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`links_locales_parent_id_idx\` ON \`links_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`classifieds\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'sell' NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`price\` text,
  	\`author_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`classifieds_author_idx\` ON \`classifieds\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`classifieds_updated_at_idx\` ON \`classifieds\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`classifieds_created_at_idx\` ON \`classifieds\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`department_id\` integer,
  	\`bonus\` text,
  	\`refer_url\` text,
  	\`open\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`jobs_department_idx\` ON \`jobs\` (\`department_id\`);`)
  await db.run(sql`CREATE INDEX \`jobs_updated_at_idx\` ON \`jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`jobs_created_at_idx\` ON \`jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`jobs_locales\` (
  	\`title\` text NOT NULL,
  	\`meta\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`jobs_locales_locale_parent_id_unique\` ON \`jobs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`jobs_locales_parent_id_idx\` ON \`jobs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rec_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`sub\` text,
  	\`title\` text NOT NULL,
  	\`text\` text,
  	\`meta\` text,
  	\`image_id\` integer,
  	\`author_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`rec_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`rec_posts_category_idx\` ON \`rec_posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_image_idx\` ON \`rec_posts\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_author_idx\` ON \`rec_posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_updated_at_idx\` ON \`rec_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_created_at_idx\` ON \`rec_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`rec_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rec_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rec_posts_rels_order_idx\` ON \`rec_posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_rels_parent_idx\` ON \`rec_posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_rels_path_idx\` ON \`rec_posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`rec_posts_rels_users_id_idx\` ON \`rec_posts_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`rec_comments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`post_id\` integer NOT NULL,
  	\`text\` text NOT NULL,
  	\`author_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`post_id\`) REFERENCES \`rec_posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`rec_comments_post_idx\` ON \`rec_comments\` (\`post_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_comments_author_idx\` ON \`rec_comments\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_comments_updated_at_idx\` ON \`rec_comments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`rec_comments_created_at_idx\` ON \`rec_comments\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`rec_categories_subs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`icon\` text DEFAULT 'books',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rec_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rec_categories_subs_order_idx\` ON \`rec_categories_subs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rec_categories_subs_parent_id_idx\` ON \`rec_categories_subs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rec_categories_subs_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rec_categories_subs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`rec_categories_subs_locales_locale_parent_id_unique\` ON \`rec_categories_subs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_categories_subs_locales_parent_id_idx\` ON \`rec_categories_subs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rec_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`icon\` text DEFAULT 'culture',
  	\`fg\` text DEFAULT '#003768',
  	\`bg\` text DEFAULT '#E8EEF2',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`rec_categories_slug_idx\` ON \`rec_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`rec_categories_updated_at_idx\` ON \`rec_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`rec_categories_created_at_idx\` ON \`rec_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`rec_categories_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rec_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`rec_categories_locales_locale_parent_id_unique\` ON \`rec_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rec_categories_locales_parent_id_idx\` ON \`rec_categories_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`polls_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`polls_options_order_idx\` ON \`polls_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`polls_options_parent_id_idx\` ON \`polls_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`polls_options_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`polls_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`polls_options_locales_locale_parent_id_unique\` ON \`polls_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`polls_options_locales_parent_id_idx\` ON \`polls_options_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`polls\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`until\` text,
  	\`active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`polls_updated_at_idx\` ON \`polls\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`polls_created_at_idx\` ON \`polls\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`polls_locales\` (
  	\`question\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`polls_locales_locale_parent_id_unique\` ON \`polls_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`polls_locales_parent_id_idx\` ON \`polls_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`poll_votes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`poll_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`option\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`poll_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`poll_votes_poll_idx\` ON \`poll_votes\` (\`poll_id\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_user_idx\` ON \`poll_votes\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_updated_at_idx\` ON \`poll_votes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_created_at_idx\` ON \`poll_votes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`theme\` text DEFAULT 'blue',
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_updated_at_idx\` ON \`albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`albums_created_at_idx\` ON \`albums\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`albums_locales\` (
  	\`name\` text NOT NULL,
  	\`date_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_locales_locale_parent_id_unique\` ON \`albums_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_locales_parent_id_idx\` ON \`albums_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`albums_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_rels_order_idx\` ON \`albums_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_parent_idx\` ON \`albums_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_path_idx\` ON \`albums_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_media_id_idx\` ON \`albums_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`chat_messages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`author_id\` integer,
  	\`system\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`chat_messages_author_idx\` ON \`chat_messages\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_updated_at_idx\` ON \`chat_messages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`chat_messages_created_at_idx\` ON \`chat_messages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`departments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`departments_slug_idx\` ON \`departments\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`departments_updated_at_idx\` ON \`departments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`departments_created_at_idx\` ON \`departments\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`departments_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`departments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`departments_locales_locale_parent_id_unique\` ON \`departments_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`departments_locales_parent_id_idx\` ON \`departments_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
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
  	\`focal_y\` numeric,
  	\`sizes_thumb_url\` text,
  	\`sizes_thumb_width\` numeric,
  	\`sizes_thumb_height\` numeric,
  	\`sizes_thumb_mime_type\` text,
  	\`sizes_thumb_filesize\` numeric,
  	\`sizes_thumb_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_newcomers\` integer DEFAULT true,
  	\`handyman_name\` text DEFAULT 'Majstor Žile',
  	\`handyman_phone\` text,
  	\`teams_url\` text DEFAULT '#',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`home_title\` text,
  	\`home_subtitle\` text,
  	\`parking_note\` text,
  	\`handyman_description\` text,
  	\`chat_subtitle\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_locales_parent_id_idx\` ON \`site_settings_locales\` (\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`DROP TABLE \`events_locales\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`users_locales\`;`)
  await db.run(sql`DROP TABLE \`users_texts\`;`)
  await db.run(sql`DROP TABLE \`links\`;`)
  await db.run(sql`DROP TABLE \`links_locales\`;`)
  await db.run(sql`DROP TABLE \`classifieds\`;`)
  await db.run(sql`DROP TABLE \`jobs\`;`)
  await db.run(sql`DROP TABLE \`jobs_locales\`;`)
  await db.run(sql`DROP TABLE \`rec_posts\`;`)
  await db.run(sql`DROP TABLE \`rec_posts_rels\`;`)
  await db.run(sql`DROP TABLE \`rec_comments\`;`)
  await db.run(sql`DROP TABLE \`rec_categories_subs\`;`)
  await db.run(sql`DROP TABLE \`rec_categories_subs_locales\`;`)
  await db.run(sql`DROP TABLE \`rec_categories\`;`)
  await db.run(sql`DROP TABLE \`rec_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`polls_options\`;`)
  await db.run(sql`DROP TABLE \`polls_options_locales\`;`)
  await db.run(sql`DROP TABLE \`polls\`;`)
  await db.run(sql`DROP TABLE \`polls_locales\`;`)
  await db.run(sql`DROP TABLE \`poll_votes\`;`)
  await db.run(sql`DROP TABLE \`albums\`;`)
  await db.run(sql`DROP TABLE \`albums_locales\`;`)
  await db.run(sql`DROP TABLE \`albums_rels\`;`)
  await db.run(sql`DROP TABLE \`chat_messages\`;`)
  await db.run(sql`DROP TABLE \`departments\`;`)
  await db.run(sql`DROP TABLE \`departments_locales\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
}
