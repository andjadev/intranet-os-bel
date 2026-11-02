'use client'

import { useAuth } from '@payloadcms/ui'
import { useEffect, type ReactNode } from 'react'

/** Payload puts a long dash before the locale name in localized field labels; the portal uses a plain hyphen. */
function useHyphenLocaleLabels() {
  useEffect(() => {
    const fix = () => {
      for (const el of document.querySelectorAll('.field-label .localized')) {
        const text = el.firstChild
        if (text?.nodeType === Node.TEXT_NODE && text.nodeValue?.startsWith('—')) {
          text.nodeValue = text.nodeValue.replace('—', '-')
        }
      }
    }
    fix()
    const observer = new MutationObserver(fix)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
}

/** Wraps the whole admin: superadmins get the decorative background (see custom.scss). */
export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth<{ role?: string }>()
  const superadmin = user?.role === 'superadmin'
  useEffect(() => {
    document.documentElement.toggleAttribute('data-osbel-bg', superadmin)
  }, [superadmin])
  useHyphenLocaleLabels()
  return children
}
