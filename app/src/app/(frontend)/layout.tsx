import { Bai_Jamjuree, Inter } from 'next/font/google'
import React from 'react'

import { getLang, getTheme } from '@/lib/server'
import './portal.css'

// Same pairing as optimal-systems.rs: Bai Jamjuree (house font) for headings, Inter for text.
const bai = Bai_Jamjuree({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-bai' })
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })

export const metadata = {
  title: 'OSBEL Intranet',
  description: 'Interni portal OPTIMAL SYSTEMS Beograd',
  icons: { icon: '/logos/site-icon.png' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const theme = await getTheme()
  return (
    <html lang={lang === 'sr' ? 'sr-Latn' : lang} className={`${bai.variable} ${inter.variable}`} data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
