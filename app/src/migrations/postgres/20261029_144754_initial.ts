import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('sr', 'en', 'de');
  CREATE TYPE "public"."enum_events_type" AS ENUM('bday', 'slava', 'event', 'food', 'holiday');
  CREATE TYPE "public"."enum_users_role" AS ENUM('superadmin', 'editor', 'employee');
  CREATE TYPE "public"."enum_links_group" AS ENUM('start', 'people', 'admin');
  CREATE TYPE "public"."enum_links_tile" AS ENUM('navy', 'mid', 'sky', 'sand');
  CREATE TYPE "public"."enum_links_icon" AS ENUM('vpn', 'health', 'vacation', 'alert', 'card', 'doc');
  CREATE TYPE "public"."enum_classifieds_kind" AS ENUM('sell', 'buy', 'give');
  CREATE TYPE "public"."enum_rec_categories_subs_icon" AS ENUM('theater', 'cinema', 'concerts', 'books', 'salas', 'wellness', 'trips', 'mountains', 'recipes', 'restaurants', 'coffee');
  CREATE TYPE "public"."enum_rec_categories_icon" AS ENUM('culture', 'weekend', 'gastro');
  CREATE TYPE "public"."enum_albums_theme" AS ENUM('blue', 'sand', 'green');
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar,
  	"type" "enum_events_type" DEFAULT 'event' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"initials" varchar,
  	"role" "enum_users_role" DEFAULT 'employee' NOT NULL,
  	"active" boolean DEFAULT true,
  	"must_change_password" boolean DEFAULT false,
  	"sessions_valid_after" timestamp(3) with time zone,
  	"entra_id" varchar,
  	"avatar_id" integer,
  	"department_id" integer,
  	"office" varchar DEFAULT 'Beograd',
  	"phone" varchar,
  	"start_date" timestamp(3) with time zone,
  	"birthday" timestamp(3) with time zone,
  	"is_newcomer" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_locales" (
  	"job_title" varchar,
  	"newcomer_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar DEFAULT '#' NOT NULL,
  	"group" "enum_links_group" NOT NULL,
  	"order" numeric DEFAULT 0,
  	"tile" "enum_links_tile",
  	"icon" "enum_links_icon" DEFAULT 'doc',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "links_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "classifieds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_classifieds_kind" DEFAULT 'sell' NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"price" varchar,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"department_id" integer,
  	"bonus" varchar,
  	"refer_url" varchar,
  	"open" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs_locales" (
  	"title" varchar NOT NULL,
  	"meta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rec_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"sub" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"meta" varchar,
  	"image_id" integer,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rec_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "rec_comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"text" varchar NOT NULL,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rec_categories_subs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" "enum_rec_categories_subs_icon" DEFAULT 'books'
  );
  
  CREATE TABLE "rec_categories_subs_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "rec_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"icon" "enum_rec_categories_icon" DEFAULT 'culture',
  	"fg" varchar DEFAULT '#003768',
  	"bg" varchar DEFAULT '#E8EEF2',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rec_categories_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "polls_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "polls_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "polls" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"until" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "polls_locales" (
  	"question" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "poll_votes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"poll_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"option" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum_albums_theme" DEFAULT 'blue',
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "albums_locales" (
  	"name" varchar NOT NULL,
  	"date_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "chat_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"author_id" integer,
  	"system" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"users_id" integer,
  	"links_id" integer,
  	"classifieds_id" integer,
  	"jobs_id" integer,
  	"rec_posts_id" integer,
  	"rec_comments_id" integer,
  	"rec_categories_id" integer,
  	"polls_id" integer,
  	"poll_votes_id" integer,
  	"albums_id" integer,
  	"chat_messages_id" integer,
  	"departments_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_newcomers" boolean DEFAULT true,
  	"handyman_name" varchar DEFAULT 'Majstor Žile',
  	"handyman_phone" varchar,
  	"teams_url" varchar DEFAULT '#',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"home_title" varchar,
  	"home_subtitle" varchar,
  	"parking_note" varchar,
  	"handyman_description" varchar,
  	"chat_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_locales" ADD CONSTRAINT "users_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_texts" ADD CONSTRAINT "users_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "links_locales" ADD CONSTRAINT "links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classifieds" ADD CONSTRAINT "classifieds_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rec_posts" ADD CONSTRAINT "rec_posts_category_id_rec_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."rec_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rec_posts" ADD CONSTRAINT "rec_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rec_posts" ADD CONSTRAINT "rec_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rec_posts_rels" ADD CONSTRAINT "rec_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rec_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rec_posts_rels" ADD CONSTRAINT "rec_posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rec_comments" ADD CONSTRAINT "rec_comments_post_id_rec_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."rec_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rec_comments" ADD CONSTRAINT "rec_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rec_categories_subs" ADD CONSTRAINT "rec_categories_subs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rec_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rec_categories_subs_locales" ADD CONSTRAINT "rec_categories_subs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rec_categories_subs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rec_categories_locales" ADD CONSTRAINT "rec_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rec_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "polls_options" ADD CONSTRAINT "polls_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "polls_options_locales" ADD CONSTRAINT "polls_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."polls_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "polls_locales" ADD CONSTRAINT "polls_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_locales" ADD CONSTRAINT "albums_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments_locales" ADD CONSTRAINT "departments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_links_fk" FOREIGN KEY ("links_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_classifieds_fk" FOREIGN KEY ("classifieds_id") REFERENCES "public"."classifieds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rec_posts_fk" FOREIGN KEY ("rec_posts_id") REFERENCES "public"."rec_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rec_comments_fk" FOREIGN KEY ("rec_comments_id") REFERENCES "public"."rec_comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rec_categories_fk" FOREIGN KEY ("rec_categories_id") REFERENCES "public"."rec_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_polls_fk" FOREIGN KEY ("polls_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_poll_votes_fk" FOREIGN KEY ("poll_votes_id") REFERENCES "public"."poll_votes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_messages_fk" FOREIGN KEY ("chat_messages_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_date_idx" ON "events" USING btree ("date");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_locales_parent_id_idx" ON "events_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_entra_id_idx" ON "users" USING btree ("entra_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_department_idx" ON "users" USING btree ("department_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_1_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "users_locales_locale_parent_id_unique" ON "users_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_locales_parent_id_idx" ON "users_locales" USING btree ("_parent_id");
  CREATE INDEX "users_texts_order_parent" ON "users_texts" USING btree ("order","parent_id");
  CREATE INDEX "users_texts_locale_parent" ON "users_texts" USING btree ("locale","parent_id");
  CREATE INDEX "links_updated_at_idx" ON "links" USING btree ("updated_at");
  CREATE INDEX "links_created_at_idx" ON "links" USING btree ("created_at");
  CREATE UNIQUE INDEX "links_locales_locale_parent_id_unique" ON "links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "links_locales_parent_id_idx" ON "links_locales" USING btree ("_parent_id");
  CREATE INDEX "classifieds_author_idx" ON "classifieds" USING btree ("author_id");
  CREATE INDEX "classifieds_updated_at_idx" ON "classifieds" USING btree ("updated_at");
  CREATE INDEX "classifieds_created_at_idx" ON "classifieds" USING btree ("created_at");
  CREATE INDEX "jobs_department_idx" ON "jobs" USING btree ("department_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_locales_parent_id_idx" ON "jobs_locales" USING btree ("_parent_id");
  CREATE INDEX "rec_posts_category_idx" ON "rec_posts" USING btree ("category_id");
  CREATE INDEX "rec_posts_image_idx" ON "rec_posts" USING btree ("image_id");
  CREATE INDEX "rec_posts_author_idx" ON "rec_posts" USING btree ("author_id");
  CREATE INDEX "rec_posts_updated_at_idx" ON "rec_posts" USING btree ("updated_at");
  CREATE INDEX "rec_posts_created_at_idx" ON "rec_posts" USING btree ("created_at");
  CREATE INDEX "rec_posts_rels_order_idx" ON "rec_posts_rels" USING btree ("order");
  CREATE INDEX "rec_posts_rels_parent_idx" ON "rec_posts_rels" USING btree ("parent_id");
  CREATE INDEX "rec_posts_rels_path_idx" ON "rec_posts_rels" USING btree ("path");
  CREATE INDEX "rec_posts_rels_users_id_idx" ON "rec_posts_rels" USING btree ("users_id");
  CREATE INDEX "rec_comments_post_idx" ON "rec_comments" USING btree ("post_id");
  CREATE INDEX "rec_comments_author_idx" ON "rec_comments" USING btree ("author_id");
  CREATE INDEX "rec_comments_updated_at_idx" ON "rec_comments" USING btree ("updated_at");
  CREATE INDEX "rec_comments_created_at_idx" ON "rec_comments" USING btree ("created_at");
  CREATE INDEX "rec_categories_subs_order_idx" ON "rec_categories_subs" USING btree ("_order");
  CREATE INDEX "rec_categories_subs_parent_id_idx" ON "rec_categories_subs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rec_categories_subs_locales_locale_parent_id_unique" ON "rec_categories_subs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rec_categories_subs_locales_parent_id_idx" ON "rec_categories_subs_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rec_categories_slug_idx" ON "rec_categories" USING btree ("slug");
  CREATE INDEX "rec_categories_updated_at_idx" ON "rec_categories" USING btree ("updated_at");
  CREATE INDEX "rec_categories_created_at_idx" ON "rec_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "rec_categories_locales_locale_parent_id_unique" ON "rec_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rec_categories_locales_parent_id_idx" ON "rec_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "polls_options_order_idx" ON "polls_options" USING btree ("_order");
  CREATE INDEX "polls_options_parent_id_idx" ON "polls_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "polls_options_locales_locale_parent_id_unique" ON "polls_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "polls_options_locales_parent_id_idx" ON "polls_options_locales" USING btree ("_parent_id");
  CREATE INDEX "polls_updated_at_idx" ON "polls" USING btree ("updated_at");
  CREATE INDEX "polls_created_at_idx" ON "polls" USING btree ("created_at");
  CREATE UNIQUE INDEX "polls_locales_locale_parent_id_unique" ON "polls_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "polls_locales_parent_id_idx" ON "polls_locales" USING btree ("_parent_id");
  CREATE INDEX "poll_votes_poll_idx" ON "poll_votes" USING btree ("poll_id");
  CREATE INDEX "poll_votes_user_idx" ON "poll_votes" USING btree ("user_id");
  CREATE INDEX "poll_votes_updated_at_idx" ON "poll_votes" USING btree ("updated_at");
  CREATE INDEX "poll_votes_created_at_idx" ON "poll_votes" USING btree ("created_at");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE UNIQUE INDEX "albums_locales_locale_parent_id_unique" ON "albums_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "albums_locales_parent_id_idx" ON "albums_locales" USING btree ("_parent_id");
  CREATE INDEX "albums_rels_order_idx" ON "albums_rels" USING btree ("order");
  CREATE INDEX "albums_rels_parent_idx" ON "albums_rels" USING btree ("parent_id");
  CREATE INDEX "albums_rels_path_idx" ON "albums_rels" USING btree ("path");
  CREATE INDEX "albums_rels_media_id_idx" ON "albums_rels" USING btree ("media_id");
  CREATE INDEX "chat_messages_author_idx" ON "chat_messages" USING btree ("author_id");
  CREATE INDEX "chat_messages_updated_at_idx" ON "chat_messages" USING btree ("updated_at");
  CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "departments_slug_idx" ON "departments" USING btree ("slug");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE UNIQUE INDEX "departments_locales_locale_parent_id_unique" ON "departments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_locales_parent_id_idx" ON "departments_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_links_id_idx" ON "payload_locked_documents_rels" USING btree ("links_id");
  CREATE INDEX "payload_locked_documents_rels_classifieds_id_idx" ON "payload_locked_documents_rels" USING btree ("classifieds_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_rec_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("rec_posts_id");
  CREATE INDEX "payload_locked_documents_rels_rec_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("rec_comments_id");
  CREATE INDEX "payload_locked_documents_rels_rec_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("rec_categories_id");
  CREATE INDEX "payload_locked_documents_rels_polls_id_idx" ON "payload_locked_documents_rels" USING btree ("polls_id");
  CREATE INDEX "payload_locked_documents_rels_poll_votes_id_idx" ON "payload_locked_documents_rels" USING btree ("poll_votes_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_chat_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_messages_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_locales" CASCADE;
  DROP TABLE "users_texts" CASCADE;
  DROP TABLE "links" CASCADE;
  DROP TABLE "links_locales" CASCADE;
  DROP TABLE "classifieds" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  DROP TABLE "rec_posts" CASCADE;
  DROP TABLE "rec_posts_rels" CASCADE;
  DROP TABLE "rec_comments" CASCADE;
  DROP TABLE "rec_categories_subs" CASCADE;
  DROP TABLE "rec_categories_subs_locales" CASCADE;
  DROP TABLE "rec_categories" CASCADE;
  DROP TABLE "rec_categories_locales" CASCADE;
  DROP TABLE "polls_options" CASCADE;
  DROP TABLE "polls_options_locales" CASCADE;
  DROP TABLE "polls" CASCADE;
  DROP TABLE "polls_locales" CASCADE;
  DROP TABLE "poll_votes" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "albums_locales" CASCADE;
  DROP TABLE "albums_rels" CASCADE;
  DROP TABLE "chat_messages" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "departments_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_events_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_links_group";
  DROP TYPE "public"."enum_links_tile";
  DROP TYPE "public"."enum_links_icon";
  DROP TYPE "public"."enum_classifieds_kind";
  DROP TYPE "public"."enum_rec_categories_subs_icon";
  DROP TYPE "public"."enum_rec_categories_icon";
  DROP TYPE "public"."enum_albums_theme";`)
}
