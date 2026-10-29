import { NextResponse, type NextRequest } from 'next/server'

import { appUrl, passwordLoginEnabled, safeNext, signInWithPassword } from '@/lib/login'

/** E-mail + password sign-in form handler. */
export async function POST(req: NextRequest) {
  if (!passwordLoginEnabled()) return new NextResponse('Not found', { status: 404 })

  const form = await req.formData()
  const email = String(form.get('email') || '').trim()
  const password = String(form.get('password') || '')
  const next = safeNext(String(form.get('next') || '/'))
  const failed = () => NextResponse.redirect(`${appUrl()}/login?error=login&next=${encodeURIComponent(next)}`, 303)
  if (!email.includes('@') || !password) return failed()

  try {
    await signInWithPassword(email, password)
  } catch {
    // Same answer for an unknown e-mail, a wrong password and a locked account.
    return failed()
  }
  return NextResponse.redirect(`${appUrl()}${next}`, 303)
}
