import { NextResponse, type NextRequest } from 'next/server'

import { appUrl, devLoginEnabled, safeNext, signIn } from '@/lib/login'

/** Local-only sign-in used until the Entra app registration exists. */
export async function POST(req: NextRequest) {
  if (!devLoginEnabled()) return new NextResponse('Not found', { status: 404 })

  const form = await req.formData()
  const email = String(form.get('email') || '').trim()
  const next = safeNext(String(form.get('next') || '/'))
  if (!email.includes('@')) return NextResponse.redirect(`${appUrl()}/login?error=login`, 303)

  try {
    await signIn({ email, name: String(form.get('name') || '') || email.split('@')[0] })
  } catch {
    return NextResponse.redirect(`${appUrl()}/login?error=login`, 303)
  }
  return NextResponse.redirect(`${appUrl()}${next}`, 303)
}
