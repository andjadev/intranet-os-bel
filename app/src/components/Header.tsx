'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { setLang } from '@/app/(frontend)/actions'
import type { Dict } from '@/i18n/dict'
import { THEME_COOKIE, type Lang, type Theme } from '@/lib/constants'

import { Icon } from './Icon'

type Props = {
  lang: Lang
  theme: Theme
  t: Dict
  canAdmin: boolean
  canChangePassword: boolean
  user: { id: number; name: string; email: string; initials: string; avatar: string | null }
}

export function Header({ lang, theme: initialTheme, t, canAdmin, canChangePassword, user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(initialTheme)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const nav: [string, string][] = [
    ['/', t.navHome],
    ['/linkovi', t.usefulTitle],
    ['/preporuke', t.recsTitle],
    ['/oglasi', t.adsTitle],
    ['/poslovi', t.navJobs],
  ]
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  }

  const switchLang = (l: Lang) =>
    startTransition(async () => {
      await setLang(l)
      router.refresh()
    })

  return (
    <header className="header">
      <div className="header-in">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- original logo file from the company website */}
          <img src="/logos/os-logo-white.svg" alt="Optimal Systems" className="brand-logo" />
          <span className="brand-name">{t.intranet}</span>
        </Link>
        <nav className="nav">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className={isActive(href) ? 'active' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="spacer" />
        <div className="langs">
          {(['sr', 'en', 'de'] as Lang[]).map((l) => (
            <button key={l} className={l === lang ? 'active' : undefined} onClick={() => switchLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? t.themeLight : t.themeDark} aria-label={theme === 'dark' ? t.themeLight : t.themeDark}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
        {canAdmin && (
          <a className="btn-portal" href="/admin">
            {t.admin}
          </a>
        )}
        <div className="avatar-menu" ref={menuRef}>
          <button className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-label={user.name} aria-expanded={open}>
            {user.avatar ? <img src={user.avatar} alt="" /> : user.initials}
          </button>
          {open && (
            <div className="menu" onClick={() => setOpen(false)}>
              <div className="menu-head">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <Link href={`/kolega/${user.id}`}>{t.viewProfile}</Link>
              {canChangePassword && <Link href="/lozinka">{t.changePassword}</Link>}
              <a href="/auth/logout">{t.logout}</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
