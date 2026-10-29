import 'server-only'

import { MicrosoftEntraId } from 'arctic'
import { cookies } from 'next/headers'

import { getPayloadClient } from './server'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from './session'

export const appUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export const entraConfigured = () =>
  Boolean(process.env.ENTRA_TENANT_ID && process.env.ENTRA_CLIENT_ID && process.env.ENTRA_CLIENT_SECRET)

export const devLoginEnabled = () => process.env.ENABLE_DEV_LOGIN === 'true'

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

/**
 * Finds the colleague by Entra object ID or e-mail, creates them on first
 * sign-in, and sets the session cookie.
 */
export async function signIn(identity: { email: string; name: string; entraId?: string }) {
  const payload = await getPayloadClient()
  const email = identity.email.toLowerCase()

  const or: { entraId?: { equals: string }; email?: { equals: string } }[] = [{ email: { equals: email } }]
  if (identity.entraId) or.push({ entraId: { equals: identity.entraId } })
  const found = await payload.find({ collection: 'users', where: { or }, limit: 1, depth: 0, overrideAccess: true })

  let user = found.docs[0]
  const makeSuperadmin = superadminEmails().includes(email)
  if (!user) {
    user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email, name: identity.name || email, entraId: identity.entraId, role: makeSuperadmin ? 'superadmin' : 'employee' },
    })
  } else if ((identity.entraId && !user.entraId) || (makeSuperadmin && user.role !== 'superadmin')) {
    // First Microsoft sign-in links the record and takes the name from Entra.
    const linking = Boolean(identity.entraId && !user.entraId)
    user = await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        ...(linking ? { entraId: identity.entraId, name: identity.name || user.name } : {}),
        ...(makeSuperadmin ? { role: 'superadmin' as const } : {}),
      },
    })
  }
  if (user.active === false) throw new Error('inactive')

  const token = await createSessionToken(user.id)
  ;(await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions)
  return user
}
