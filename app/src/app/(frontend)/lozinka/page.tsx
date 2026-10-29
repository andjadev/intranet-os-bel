import Link from 'next/link'

import { MIN_PASSWORD_LENGTH } from '@/lib/constants'
import { getDict, requireUser } from '@/lib/server'

import { changePassword } from '../actions'

export const dynamic = 'force-dynamic'

const ERRORS = { short: 'pwTooShort', mismatch: 'pwMismatch', same: 'pwSame', wrong: 'pwWrong' } as const

// Outside the (portal) layout, which sends colleagues here while their password is still temporary.
export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams
  const user = await requireUser()
  const t = await getDict()
  const errorKey = error && error in ERRORS ? ERRORS[error as keyof typeof ERRORS] : null

  return (
    <div className="login-page">
      {/* eslint-disable-next-line @next/next/no-img-element -- original logo file from the company website */}
      <img src="/logos/os-logo-white.svg" alt="Optimal Systems" className="login-logo" />
      <section className="card login-card">
        <span className="eyebrow">{t.intranet}</span>
        <h1>{t.changePassword}</h1>

        {saved ? (
          <>
            <div className="login-msg">{t.pwSaved}</div>
            <Link className="btn btn-ms" href="/">
              {t.navHome} →
            </Link>
          </>
        ) : (
          <>
            <p>
              {user.mustChangePassword ? `${t.changePasswordFirst} ` : ''}
              {t.changePasswordSub.replace('{n}', String(MIN_PASSWORD_LENGTH))}
            </p>
            {errorKey && <div className="login-error">{t[errorKey]}</div>}
            <form className="login-form" action={changePassword}>
              {/* Lets password managers attach the new password to the right account. */}
              <input type="hidden" name="username" autoComplete="username" value={user.email} />
              <label className="label-caps" htmlFor="pw-current">
                {t.currentPassword}
              </label>
              <input className="input" id="pw-current" name="current" type="password" autoComplete="current-password" required />
              <label className="label-caps" htmlFor="pw-next">
                {t.newPassword}
              </label>
              <input
                className="input"
                id="pw-next"
                name="next"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <label className="label-caps" htmlFor="pw-repeat">
                {t.repeatPassword}
              </label>
              <input
                className="input"
                id="pw-repeat"
                name="repeat"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <button className="btn btn-ms" type="submit">
                {t.save}
              </button>
            </form>
            {!user.mustChangePassword && (
              <Link className="hint" href="/">
                {t.back}
              </Link>
            )}
          </>
        )}
      </section>
    </div>
  )
}
