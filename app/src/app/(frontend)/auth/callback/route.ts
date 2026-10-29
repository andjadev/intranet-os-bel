import { decodeIdToken } from 'arctic'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { appUrl, entraClient, entraConfigured, safeNext, signIn } from '@/lib/login'

type IdClaims = { oid?: string; email?: string; preferred_username?: string; name?: string; tid?: string }

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const state = req.nextUrl.searchParams.get('state')
  const code = req.nextUrl.searchParams.get('code')
  const storedState = jar.get('entra_state')?.value
  const verifier = jar.get('entra_verifier')?.value
  const next = safeNext(jar.get('entra_next')?.value)
  for (const c of ['entra_state', 'entra_verifier', 'entra_next']) jar.delete(c)

  const fail = (reason: string) => NextResponse.redirect(`${appUrl()}/login?error=${reason}`)
  if (!entraConfigured()) return fail('config')
  if (!code || !state || !verifier || state !== storedState) return fail('state')

  try {
    const tokens = await entraClient().validateAuthorizationCode(code, verifier)
    // The ID token comes straight from Microsoft's token endpoint over TLS, so
    // decoding without re-verifying the signature is the documented approach.
    const claims = decodeIdToken(tokens.idToken()) as IdClaims
    if (claims.tid && claims.tid !== process.env.ENTRA_TENANT_ID) return fail('tenant')
    const email = claims.email || claims.preferred_username
    if (!email || !claims.oid) return fail('claims')
    await signIn({ email, name: claims.name || email, entraId: claims.oid })
  } catch (err) {
    console.error('[auth] Entra callback failed', err)
    return fail('login')
  }
  return NextResponse.redirect(`${appUrl()}${next}`)
}
