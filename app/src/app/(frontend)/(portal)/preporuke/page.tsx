import { redirect } from 'next/navigation'

import { loadRecCategories } from '@/lib/data'
import { getLang } from '@/lib/server'

export default async function RecsIndex() {
  const cats = await loadRecCategories(await getLang())
  redirect(`/preporuke/${cats[0]?.slug ?? 'anketa'}`)
}
