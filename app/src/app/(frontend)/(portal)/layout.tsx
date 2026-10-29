import { redirect } from 'next/navigation'
import React from 'react'

import { Header } from '@/components/Header'
import { passwordLoginEnabled } from '@/lib/login'
import { getDict, getLang, getPayloadClient, getTheme, isEditor, requireUser } from '@/lib/server'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  // A temporary password (set by a superadmin) must be replaced before using the portal.
  if (user.mustChangePassword) redirect('/lozinka')
  const lang = await getLang()
  const t = await getDict()
  const theme = await getTheme()
  const avatar = await avatarUrl(user.avatar)

  return (
    <div className="shell">
      <Header
        lang={lang}
        theme={theme}
        t={t}
        user={{ name: user.name, email: user.email, initials: user.initials || '', avatar, id: user.id }}
        canAdmin={isEditor(user)}
        canChangePassword={passwordLoginEnabled()}
      />
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer-in">
          <span className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- original logo file from the company website */}
            <img src="/logos/os-logo-white.svg" alt="Optimal Systems" />
            <span>{t.footer}</span>
          </span>
          <span>OPTIMAL SYSTEMS Beograd · Software für Macher · Part of the KYOCERA Document Solutions group</span>
        </div>
      </footer>
    </div>
  )
}

async function avatarUrl(avatar: unknown): Promise<string | null> {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) return (avatar as { url?: string }).url ?? null
  if (!avatar) return null
  const media = await (await getPayloadClient())
    .findByID({ collection: 'media', id: avatar as number, depth: 0, overrideAccess: true })
    .catch(() => null)
  return media?.sizes?.thumb?.url || media?.url || null
}
