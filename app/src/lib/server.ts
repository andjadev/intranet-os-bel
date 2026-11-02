import 'server-only'

import config from '@payload-config'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { User } from '../payload-types'
import { DICTS } from '../i18n/dict'
import { DEFAULT_LANG, LANG_COOKIE, LOCALES, THEME_COOKIE, type Lang, type Theme } from './constants'

export const getPayloadClient = () => getPayload({ config })

export const getLang = cache(async (): Promise<Lang> => {
  const v = (await cookies()).get(LANG_COOKIE)?.value as Lang | undefined
  return v && (LOCALES as readonly string[]).includes(v) ? v : DEFAULT_LANG
})

export const getTheme = async (): Promise<Theme> =>
  (await cookies()).get(THEME_COOKIE)?.value === 'dark' ? 'dark' : 'light'

export const getDict = async () => DICTS[await getLang()]

export const getUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return (user as User | null) ?? null
})

export async function requireUser(): Promise<User> {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export const isEditor = (u: Pick<User, 'role'> | null | undefined) => u?.role === 'superadmin' || u?.role === 'editor'

/** "Ivan J." - short display name used in chat and comments. */
export const shortName = (name?: string | null) => {
  if (!name) return ''
  const [first, last] = name.split(/\s+/)
  return last ? `${first} ${last.charAt(0)}.` : first
}
