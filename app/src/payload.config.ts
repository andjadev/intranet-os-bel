import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { rsLatin } from '@payloadcms/translations/languages/rsLatin'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Albums } from './collections/Albums'
import { ChatMessages } from './collections/ChatMessages'
import { Classifieds } from './collections/Classifieds'
import { Departments } from './collections/Departments'
import { Events } from './collections/Events'
import { Jobs } from './collections/Jobs'
import { LinkCategories } from './collections/LinkCategories'
import { Links } from './collections/Links'
import { Media } from './collections/Media'
import { PollVotes, Polls, RecCategories, RecComments, RecPosts } from './collections/Recommendations'
import { Users } from './collections/Users'
import { migrations as postgresMigrations } from './migrations/postgres'
import { migrations as sqliteMigrations } from './migrations/sqlite'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// SQLite (a single file) by default; set DATABASE_URL=postgres://... to use PostgreSQL.
const databaseUrl = process.env.DATABASE_URL || 'file:./intranet.db'
const usePostgres = /^postgres(ql)?:\/\//.test(databaseUrl)

// Uploads go to the local MEDIA_DIR unless an S3-compatible bucket is configured (needed on Netlify,
// whose functions have no persistent disk). Files are still served through /api/media/file/, so the
// bucket stays private and Payload's access control applies.
const s3Bucket = process.env.S3_BUCKET

export default buildConfig({
  serverURL: process.env.APP_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · OSBEL Intranet admin', icons: [{ rel: 'icon', type: 'image/png', url: '/logos/site-icon.png' }] },
    // Matches the portal, which has no dark mode.
    theme: 'light',
    components: {
      beforeNavLinks: ['/components/admin/BackToIntranet#BackToIntranetNav'],
      actions: ['/components/admin/BackToIntranet#BackToIntranetAction'],
      graphics: {
        Icon: '/components/admin/Graphics#AdminIcon',
        Logo: '/components/admin/Graphics#AdminLogo',
      },
    },
  },
  routes: { admin: '/admin' },
  // The portal and admin use the REST API only; no GraphQL endpoint to expose.
  graphQL: { disable: true },
  // The admin language follows the portal's SR/EN/DE switch (see proxy.ts).
  i18n: {
    supportedLanguages: { rs: rsLatin, en, de },
    fallbackLanguage: 'rs',
  },
  localization: {
    locales: [
      { code: 'sr', label: 'Srpski' },
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
    ],
    defaultLocale: 'sr',
    fallback: true,
  },
  collections: [
    Events,
    Users,
    Links,
    LinkCategories,
    Classifieds,
    Jobs,
    RecPosts,
    RecComments,
    RecCategories,
    Polls,
    PollVotes,
    Albums,
    ChatMessages,
    Departments,
    Media,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: usePostgres
    ? postgresAdapter({
        // Serverless (Netlify): each function instance keeps only a few connections; use a pooler URL.
        pool: { connectionString: databaseUrl, max: process.env.NETLIFY ? 2 : 10 },
        migrationDir: path.resolve(dirname, 'migrations/postgres'),
        prodMigrations: postgresMigrations,
      })
    : sqliteAdapter({
        client: { url: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations/sqlite'),
        prodMigrations: sqliteMigrations,
      }),
  sharp,
  plugins: [
    // Always registered (enabled or not) so the admin import map keeps its upload component in every environment.
    s3Storage({
      enabled: Boolean(s3Bucket),
      collections: { media: true },
      bucket: s3Bucket || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        // Supabase Storage and most non-AWS providers need path-style URLs.
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
