import Link from 'next/link'

import { idOf } from '@/lib/data'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ tim?: string }> }) {
  const { tim } = await searchParams
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()

  const jobs = await payload.find({
    collection: 'jobs',
    locale: lang,
    where: { open: { equals: true } },
    depth: 1,
    limit: 100,
    overrideAccess: true,
  })
  // Filters only offer teams that actually have open positions.
  const teams = new Map<string, string>()
  for (const j of jobs.docs) {
    if (typeof j.department === 'object' && j.department) teams.set(j.department.slug, j.department.name)
  }
  const list = jobs.docs.filter((j) => !tim || (typeof j.department === 'object' && j.department?.slug === tim))

  return (
    <div>
      <header className="hero">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
        <div className="page-head">
          <div>
            <h1 className="page-h1">{t.jobsTitle}</h1>
            <p className="page-sub">{t.jobsSub}</p>
          </div>
          <div className="filters">
            <Link href="/poslovi" className={`pill${!tim ? ' active' : ''}`}>
              {t.everyone}
            </Link>
            {[...teams].map(([slug, name]) => (
              <Link key={slug} href={`/poslovi?tim=${slug}`} className={`pill${tim === slug ? ' active' : ''}`}>
                {name}
              </Link>
            ))}
          </div>
        </div>
      </header>
      {list.length === 0 && <p className="empty">{t.noJobs}</p>}
      <div className="jobs">
        {list.map((j) => (
          <section key={idOf(j)} className="card job">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="job-title">{j.title}</span>
              {j.meta && <span className="job-meta">{j.meta}</span>}
            </div>
            <div className="job-end">
              {j.bonus && <span className="bonus">{j.bonus}</span>}
              <a className="btn" href={j.referUrl || `mailto:?subject=${encodeURIComponent(j.title)}`}>
                {t.refer}
              </a>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
