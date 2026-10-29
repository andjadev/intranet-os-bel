import 'server-only'

import { MicrosoftEntraId } from 'arctic'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

import type { User } from '../payload-types'
import { getPayloadClient } from './server'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from './session'

export const appUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export const entraConfigured = () =>
  Boolean(process.env.ENTRA_TENANT_ID && process.env.ENTRA_CLIENT_ID && process.env.ENTRA_CLIENT_SECRET)

export const devLoginEnabled = () => process.env.ENABLE_DEV_LOGIN === 'true'

/** E-mail + password sign-in; switch off once everyone uses Microsoft. */
export const passwordLoginEnabled = () => process.env.DISABLE_PASSWORD_LOGIN !== 'true'

export function entraClient() {
  return new MicrosoftEntraId(
    process.env.ENTRA_TENANT_ID!,
    process.env.ENTRA_CLIENT_ID!,
    process.env.ENTRA_CLIENT_SECRET!,
    `${appUrl()}/auth/callback`,
  )
}

const superadminEmails = () =>
  (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

/** Only allow relative in-app redirects after login. */
export const safeNext = (next: string | null | undefined) =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : '/'

/** Sets the session cookie for this colleague. */
export async function startSession(user: Pick<User, 'id'>) {
  const token = await createSessionToken(user.id)
  ;(await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions)
}

/** Addresses in SUPERADMIN_EMAILS become superadmin on sign-in. */
async function promoteSuperadmin(user: User): Promise<User> {
  if (user.role === 'superadmin' || !superadminEmails().includes(user.email.toLowerCase())) return user
  const payload = await getPayloadClient()
  return payload.update({ collection: 'users', id: user.id, overrideAccess: true, data: { role: 'superadmin' } })
}

/**
 * Microsoft (or dev) sign-in: finds the colleague by Entra object ID or e-mail,
 * creates them on first sign-in, and sets the session cookie.
 */
export async function signIn(identity: { email: string; name: string; entraId?: string }) {
  const payload = await getPayloadClient()
  const email = identity.email.toLowerCase()

  const or: { entraId?: { equals: string }; email?: { equals: string } }[] = [{ email: { equals: email } }]
  if (identity.entraId) or.push({ entraId: { equals: identity.entraId } })
  const found = await payload.find({ collection: 'users', where: { or }, limit: 1, depth: 0, overrideAccess: true })

  let user = found.docs[0]
  if (!user) {
    user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      // Payload requires a password; this one is random and never used (Microsoft signs them in).
      context: { randomPassword: true },
      data: {
        email,
        name: identity.name || email,
        entraId: identity.entraId,
        role: 'employee',
        password: randomBytes(32).toString('base64url'),
        mustChangePassword: false,
      },
    })
  } else if (identity.entraId && !user.entraId) {
    // First Microsoft sign-in links the record and takes the name from Entra.
    user = await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { entraId: identity.entraId, name: identity.name || user.name },
    })
  }
  if (user.active === false) throw new Error('inactive')

  user = await promoteSuperadmin(user)
  await startSession(user)
  return user
}

/**
 * E-mail + password sign-in. Payload checks the hash and locks the account after
 * repeated failures; accounts are never created here (a superadmin creates them).
 */
export async function signInWithPassword(email: string, password: string) {
  const payload = await getPayloadClient()
  const { user } = await payload.login({ collection: 'users', data: { email: email.toLowerCase(), password } })
  if (!user || user.active === false) throw new Error('inactive')

  const signedIn = await promoteSuperadmin(user as User)
  await startSession(signedIn)
  return signedIn
}
