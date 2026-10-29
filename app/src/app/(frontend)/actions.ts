'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { LANG_COOKIE, LOCALES, MIN_PASSWORD_LENGTH, type Lang } from '@/lib/constants'
import { pollCounts } from '@/lib/data'
import { startSession } from '@/lib/login'
import { getPayloadClient, getUser, isEditor, shortName } from '@/lib/server'

const MAX_TEXT = 1000
const clean = (s: unknown, max = MAX_TEXT) => String(s ?? '').trim().slice(0, max)

async function authed() {
  const user = await getUser()
  if (!user) throw new Error('Not signed in')
  return { user, payload: await getPayloadClient() }
}

export async function setLang(lang: Lang) {
  if (!(LOCALES as readonly string[]).includes(lang)) return
  ;(await cookies()).set(LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
}

// ---------- password ----------

/** /lozinka form. Checks the current password (with Payload's lockout) before setting the new one. */
export async function changePassword(form: FormData) {
  const { user, payload } = await authed()
  const current = String(form.get('current') ?? '')
  const next = String(form.get('next') ?? '')
  const fail = (error: string) => redirect(`/lozinka?error=${error}`)

  if (next.length < MIN_PASSWORD_LENGTH) fail('short')
  if (next !== String(form.get('repeat') ?? '')) fail('mismatch')
  if (next === current) fail('same')

  const ok = await payload
    .login({ collection: 'users', data: { email: user.email, password: current } })
    .then(() => true)
    .catch(() => false)
  if (!ok) fail('wrong')

  // Signs out every other session (sessionsValidAfter), so this device gets a fresh one.
  await payload.update({ collection: 'users', id: user.id, data: { password: next }, user, overrideAccess: true })
  await startSession(user)
  redirect('/lozinka?saved=1')
}

// ---------- recommendations ----------

export async function toggleLike(postId: number) {
  const { user, payload } = await authed()
  const post = await payload.findByID({ collection: 'rec-posts', id: postId, depth: 0, overrideAccess: true })
  const likes = ((post.likes ?? []) as (number | { id: number })[]).map((l) => (typeof l === 'object' ? l.id : l))
  const next = likes.includes(user.id) ? likes.filter((id) => id !== user.id) : [...likes, user.id]
  await payload.update({ collection: 'rec-posts', id: postId, data: { likes: next }, overrideAccess: true })
  revalidatePath('/', 'layout')
  return { liked: next.includes(user.id), count: next.length }
}

export async function addComment(postId: number, text: string) {
  const { user, payload } = await authed()
  const body = clean(text)
  if (!body) return null
  const doc = await payload.create({
    collection: 'rec-comments',
    data: { post: postId, text: body, author: user.id },
    user,
    overrideAccess: false,
  })
  revalidatePath('/preporuke', 'layout')
  return { id: doc.id, name: shortName(user.name), text: body }
}

export async function createPost(input: { category: number; sub?: string; title: string; text?: string; meta?: string }) {
  const { user, payload } = await authed()
  const title = clean(input.title, 200)
  if (!title) return { ok: false }
  await payload.create({
    collection: 'rec-posts',
    data: {
      category: input.category,
      sub: clean(input.sub, 60) || undefined,
      title,
      text: clean(input.text, 4000),
      meta: clean(input.meta, 200),
      author: user.id,
    },
    user,
    overrideAccess: false,
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function vote(pollId: number, option: string) {
  const { user, payload } = await authed()
  const poll = await payload.findByID({ collection: 'polls', id: pollId, depth: 0, overrideAccess: true })
  if (!poll.active || !(poll.options ?? []).some((o) => o.id === option)) throw new Error('Invalid vote')

  const existing = await payload.find({
    collection: 'poll-votes',
    where: { and: [{ poll: { equals: pollId } }, { user: { equals: user.id } }] },
    depth: 0,
    limit: 10,
    overrideAccess: true,
  })
  const same = existing.docs.some((v) => v.option === option)
  // Clicking your own choice again withdraws the vote (README: "ponovni klik povlači glas").
  for (const v of existing.docs) await payload.delete({ collection: 'poll-votes', id: v.id, overrideAccess: true })
  if (!same) {
    await payload.create({ collection: 'poll-votes', data: { poll: pollId, user: user.id, option }, overrideAccess: true })
  }
  revalidatePath('/', 'layout')
  return pollCounts(pollId, user.id)
}

// ---------- chat ----------

export type ChatMsg = { id: number; text: string; time: string; system: boolean; mine: boolean; name: string; initials: string }

export async function getChat(): Promise<ChatMsg[]> {
  const { user, payload } = await authed()
  const res = await payload.find({ collection: 'chat-messages', sort: '-createdAt', limit: 50, depth: 1, overrideAccess: true })
  const fmt = new Intl.DateTimeFormat('sr-Latn', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Belgrade' })
  return res.docs.reverse().map((m) => {
    const a = typeof m.author === 'object' ? m.author : null
    return {
      id: m.id,
      text: m.text,
      time: fmt.format(new Date(m.createdAt)),
      system: Boolean(m.system),
      mine: a?.id === user.id,
      name: shortName(a?.name),
      initials: a?.initials || '',
    }
  })
}

export async function sendChat(text: string) {
  const { user, payload } = await authed()
  const body = clean(text)
  if (body) await payload.create({ collection: 'chat-messages', data: { text: body, author: user.id }, user, overrideAccess: false })
  return getChat()
}

// ---------- classifieds ----------

export async function createAd(input: { kind: 'sell' | 'buy' | 'give'; title: string; description?: string; price?: string }) {
  const { user, payload } = await authed()
  const title = clean(input.title, 200)
  if (!title || !['sell', 'buy', 'give'].includes(input.kind)) return { ok: false }
  await payload.create({
    collection: 'classifieds',
    data: { kind: input.kind, title, description: clean(input.description, 2000), price: clean(input.price, 60), author: user.id },
    user,
    overrideAccess: false,
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function deleteAd(id: number) {
  const { user, payload } = await authed()
  const ad = await payload.findByID({ collection: 'classifieds', id, depth: 0, overrideAccess: true })
  const authorId = typeof ad.author === 'object' ? ad.author?.id : ad.author
  if (authorId !== user.id && !isEditor(user)) throw new Error('Forbidden')
  await payload.delete({ collection: 'classifieds', id, overrideAccess: true })
  revalidatePath('/', 'layout')
}
