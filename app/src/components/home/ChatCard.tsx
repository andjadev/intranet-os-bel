'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getChat, sendChat, type ChatMsg } from '@/app/(frontend)/actions'
import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'

const POLL_MS = 10_000

export function ChatCard({ initial, subtitle, teamsUrl, t }: { initial: ChatMsg[]; subtitle: string; teamsUrl: string; t: Dict }) {
  const [msgs, setMsgs] = useState(initial)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const lastId = msgs.at(-1)?.id

  const scrollDown = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(scrollDown, [lastId, scrollDown])

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') getChat().then(setMsgs).catch(() => {})
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [])

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setDraft('')
    try {
      setMsgs(await sendChat(text))
    } catch {
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="card">
      <div className="chat-head">
        <span className="ico" style={{ color: '#fff', background: 'var(--brown)' }}>
          <Icon name="chat" size={13} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 1 auto' }}>
          <h2 className="card-title">OSBEL Chat</h2>
          <span className="office-row-sub">{subtitle}</span>
        </span>
        {teamsUrl && teamsUrl !== '#' && (
          <a className="chat-teams" href={teamsUrl} target="_blank" rel="noreferrer">
            {t.openTeams} ↗
          </a>
        )}
      </div>
      <div className="chat-list" ref={listRef}>
        {msgs.length === 0 && <span className="msg-sys">{t.chatEmpty}</span>}
        {msgs.map((m) =>
          m.system ? (
            <span key={m.id} className="msg-sys">
              {m.text} · {m.time}
            </span>
          ) : m.mine ? (
            <span key={m.id} className="msg-me">
              <span className="msg-text">{m.text}</span>
              <span className="msg-time">{m.time}</span>
            </span>
          ) : (
            <div key={m.id} className="msg-other">
              <span className="avatar msg-avatar">{m.initials}</span>
              <span className="msg-bubble">
                <span className="msg-meta">
                  <span className="msg-name">{m.name}</span>
                  <span className="msg-time">{m.time}</span>
                </span>
                <span className="msg-text">{m.text}</span>
              </span>
            </div>
          ),
        )}
      </div>
      <div className="chat-form">
        <input
          className="input"
          value={draft}
          placeholder={t.chatPlaceholder}
          maxLength={1000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              send()
            }
          }}
        />
        <button className="chat-send" onClick={send} disabled={sending} title={t.send}>
          {t.send} <Icon name="arrow" size={14} />
        </button>
      </div>
    </section>
  )
}
