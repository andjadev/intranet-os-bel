'use client'

import { useState, useTransition } from 'react'

import { vote } from '@/app/(frontend)/actions'
import { Icon } from '@/components/Icon'
import type { PollData } from '@/lib/data'

type Labels = { votes: string; poll: string; until: string | null }

export function PollBox({ poll, labels, big = false }: { poll: PollData; labels: Labels; big?: boolean }) {
  const [state, setState] = useState({ counts: poll.counts, mine: poll.mine })
  const [pending, startTransition] = useTransition()

  const total = Object.values(state.counts).reduce((a, b) => a + b, 0)

  const onVote = (option: string) => {
    if (pending) return
    // Optimistic update; the server result replaces it.
    const counts = { ...state.counts }
    if (state.mine) counts[state.mine] = Math.max(0, (counts[state.mine] ?? 1) - 1)
    const mine = state.mine === option ? null : option
    if (mine) counts[mine] = (counts[mine] ?? 0) + 1
    setState({ counts, mine })
    startTransition(async () => {
      try {
        setState(await vote(poll.id, option))
      } catch {
        setState({ counts: poll.counts, mine: poll.mine })
      }
    })
  }

  return (
    <div className={`poll-box${big ? ' big' : ''}`}>
      {big ? (
        <span className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-blue)' }}>
          <span className="ico" style={{ width: 24, height: 24, borderRadius: 7, color: '#fff', background: 'var(--navy)' }}>
            <Icon name="poll" size={13} />
          </span>
          {labels.poll}
        </span>
      ) : (
        <span className="row-between" style={{ gap: 6 }}>
          <span className="rec-cat-ico" style={{ color: '#fff', background: 'var(--navy)' }}>
            <Icon name="poll" size={15} />
          </span>
          <span className="poll-total">
            {total} {labels.votes}
          </span>
        </span>
      )}
      <span className="poll-q">{poll.question}</span>
      {poll.options.map((o) => {
        const v = state.counts[o.id] ?? 0
        const pct = total ? Math.round((v / total) * 100) : 0
        const mine = state.mine === o.id
        return (
          <button key={o.id} className={`poll-opt${mine ? ' mine' : ''}`} onClick={() => onVote(o.id)} aria-pressed={mine}>
            <span className="poll-bar" style={{ width: `${pct}%` }} />
            <span className="poll-opt-label">{o.label}</span>
            <span className="poll-pct">{pct}%</span>
          </button>
        )
      })}
      {big && (
        <span className="poll-foot">
          {total} {labels.votes}
          {labels.until ? ` · ${labels.until}` : ''}
        </span>
      )}
    </div>
  )
}
