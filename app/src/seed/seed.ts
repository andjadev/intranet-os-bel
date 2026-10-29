/**
 * Creates the starting accounts (superadmins) with a random temporary password
 * each, printed once. Existing accounts are left alone, so it is safe to re-run.
 * Everything else is entered in /admin.
 *
 *   npm run seed          create missing accounts
 *   npm run seed:reset    delete ALL content (every collection, uploaded files,
 *                         portal settings), then create the accounts
 *
 * Works against whatever DATABASE_URL (and S3_*) points at, e.g. Supabase.
 */
import config from '@payload-config'
import { randomBytes } from 'crypto'
import { getPayload, type CollectionSlug } from 'payload'

const ACCOUNTS = [
  { name: 'Anđela Mijailović', email: 'mijailovic@optimal-systems.de' },
  { name: 'Sana Papić', email: 'papic@optimal-systems.de' },
]

// Children before parents, so nothing is left pointing at a deleted document.
const ALL_COLLECTIONS: CollectionSlug[] = [
  'chat-messages', 'poll-votes', 'polls', 'rec-comments', 'rec-posts', 'rec-categories',
  'albums', 'jobs', 'classifieds', 'links', 'events', 'users', 'departments', 'media',
]

const SITE_SETTINGS_EMPTY = {
  homeTitle: null,
  homeSubtitle: null,
  parkingNote: null,
  handymanPhone: null,
  handymanDescription: null,
  chatSubtitle: null,
}

/** 16 characters without look-alikes (0/O, 1/l/I), easy to type from a message. */
const tempPassword = () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(16), (b) => alphabet[b % alphabet.length]).join('')
}

async function main() {
  const payload = await getPayload({ config })

  if (process.env.SEED_RESET === 'true') {
    payload.logger.info('Deleting all content…')
    for (const collection of ALL_COLLECTIONS) {
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    }
    for (const locale of ['sr', 'en', 'de'] as const) {
      await payload.updateGlobal({ slug: 'site-settings', locale, overrideAccess: true, data: SITE_SETTINGS_EMPTY })
    }
  }

  const created: { email: string; password: string }[] = []
  for (const account of ACCOUNTS) {
    const existing = await payload.count({ collection: 'users', where: { email: { equals: account.email } }, overrideAccess: true })
    if (existing.totalDocs > 0) {
      payload.logger.info(`${account.email} already exists – unchanged.`)
      continue
    }
    const password = tempPassword()
    // A password set here is temporary: the users hook marks it "must change" on first sign-in.
    await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { ...account, role: 'superadmin', office: 'Beograd', password },
    })
    created.push({ email: account.email, password })
  }

  if (created.length) {
    console.log('\nTemporary passwords (shown only now; changed on first sign-in):')
    for (const c of created) console.log(`  ${c.email}  ${c.password}`)
    console.log('')
  }
  payload.logger.info('Seed finished.')
  process.exit(0)
}

// `payload run` imports this module, so the work must finish via top-level await.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
