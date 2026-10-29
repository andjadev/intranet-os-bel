import { generateCodeVerifier, generateState } from 'arctic'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { appUrl, entraClient, entraConfigured, safeNext } from '@/lib/login'

const tmpCookie = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 }

export async function GET(req: NextRequest) {
  if (!entraConfigured()) return NextResponse.redirect(`${appUrl()}/login?error=config`)

  const state = generateState()
  const verifier = generateCodeVerifier()
  const url = entraClient().createAuthorizationURL(state, verifier, ['openid', 'profile', 'email', 'User.Read'])

  const jar = await cookies()
  jar.set('entra_state', state, tmpCookie)
  jar.set('entra_verifier', verifier, tmpCookie)
  jar.set('entra_next', safeNext(req.nextUrl.searchParams.get('next')), tmpCookie)
  return NextResponse.redirect(url)
}
