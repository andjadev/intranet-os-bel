import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
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

export default buildConfig({
  serverURL: process.env.APP_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · OSBEL Intranet admin' },
    // Matches the portal, which has no dark mode.
    theme: 'light',
    components: {
      beforeNavLinks: ['/components/admin/BackToIntranet#BackToIntranetNav'],
      actions: ['/components/admin/BackToIntranet#BackToIntranetAction'],
    },
  },
  routes: { admin: '/admin' },
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
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations/postgres'),
        prodMigrations: postgresMigrations,
      })
    : sqliteAdapter({
        client: { url: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations/sqlite'),
        prodMigrations: sqliteMigrations,
      }),
  sharp,
  plugins: [],
})
