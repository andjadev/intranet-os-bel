import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { appUrl } from '@/lib/login'
import { SESSION_COOKIE } from '@/lib/session'

export async function GET() {
  ;(await cookies()).delete(SESSION_COOKIE)
  return NextResponse.redirect(`${appUrl()}/login`)
}
