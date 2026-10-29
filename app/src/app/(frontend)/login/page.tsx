import { redirect } from 'next/navigation'

import { devLoginEnabled, entraConfigured, safeNext } from '@/lib/login'
import { getDict, getPayloadClient, getUser } from '@/lib/server'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams
  const next = safeNext(rawNext)
  if (await getUser()) redirect(next)

  const t = await getDict()
  const entra = entraConfigured()
  const dev = devLoginEnabled()

  // In dev mode, offer the seeded colleagues so roles can be tried quickly.
  const people = dev
    ? (
        await (await getPayloadClient()).find({
          collection: 'users',
          limit: 200,
          sort: 'name',
          depth: 0,
          overrideAccess: true,
          select: { name: true, email: true, role: true },
        })
      ).docs
    : []

  return (
    <div className="login-page">
      {/* eslint-disable-next-line @next/next/no-img-element -- original logo file from the company website */}
      <img src="/logos/os-logo-white.svg" alt="Optimal Systems" className="login-logo" />
      <section className="card login-card">
        <span className="eyebrow">{t.intranet}</span>
        <h1>{t.loginTitle}</h1>
        <p>{t.loginSub}</p>
        {error && <div className="login-error">{error === 'config' ? t.loginNotConfigured : t.loginError}</div>}

        {entra ? (
          <a className="btn btn-ms" href={`/auth/microsoft?next=${encodeURIComponent(next)}`}>
            <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            {t.loginMicrosoft}
          </a>
        ) : (
          <div className="hint">{t.loginNotConfigured}</div>
        )}

        {dev && (
          <form className="dev-box" method="post" action="/auth/dev">
            <span className="label-caps">{t.devLogin}</span>
            <span className="hint">{t.devLoginHint}</span>
            <input type="hidden" name="next" value={next} />
            <select className="input" name="email" defaultValue={people.find((p) => p.role === 'superadmin')?.email}>
              {people.map((p) => (
                <option key={p.id} value={p.email}>
                  {p.name} · {p.role}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost" type="submit" style={{ justifyContent: 'center' }}>
              {t.devLoginAs} →
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
