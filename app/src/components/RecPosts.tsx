'use client'

import { useState, useTransition } from 'react'

import { addComment, createPost, toggleLike } from '@/app/(frontend)/actions'
import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'

type Comment = { id: number; name: string; text: string; time: string }
type Post = {
  id: number
  title: string
  text: string
  meta: string
  tag: string
  icon: string
  image: string | null
  author: string
  time: string
  likes: number
  liked: boolean
  comments: Comment[]
}

export function PostCard({ post, colors, t }: { post: Post; colors: { fg: string; bg: string }; t: Dict }) {
  const [like, setLike] = useState({ liked: post.liked, count: post.likes })
  const [comments, setComments] = useState(post.comments)
  const [draft, setDraft] = useState('')
  const [pending, startTransition] = useTransition()

  const onLike = () => {
    setLike((l) => ({ liked: !l.liked, count: l.count + (l.liked ? -1 : 1) }))
    startTransition(async () => {
      try {
        setLike(await toggleLike(post.id))
      } catch {
        setLike({ liked: post.liked, count: post.likes })
      }
    })
  }

  const send = () => {
    const text = draft.trim()
    if (!text || pending) return
    setDraft('')
    startTransition(async () => {
      const c = await addComment(post.id, text).catch(() => null)
      if (c) setComments((cs) => [...cs, { ...c, time: t.now }])
      else setDraft(text)
    })
  }

  return (
    <article className="post">
      <div className="post-img" style={{ color: colors.fg, background: colors.bg }}>
        {post.image ? <img src={post.image} alt="" /> : <Icon name={post.icon} size={34} stroke={1.5} />}
      </div>
      <div className="post-body">
        <div className="post-top">
          {post.tag && (
            <span className="post-tag" style={{ color: colors.fg, background: colors.bg }}>
              {post.tag}
            </span>
          )}
          <span className="post-by">
            {post.author} · {post.time}
          </span>
          <span className="post-acts">
            <button className={`post-like${like.liked ? ' liked' : ''}`} onClick={onLike} aria-pressed={like.liked}>
              <span>
                <Icon name="heart" size={18} fill={like.liked ? 'currentColor' : 'none'} />
              </span>
              {like.count}
            </button>
            <span className="post-ccount">
              <Icon name="chat" size={17} stroke={1.5} />
              {comments.length}
            </span>
          </span>
        </div>
        <span className="post-title">{post.title}</span>
        {post.text && <span className="post-text">{post.text}</span>}
        {post.meta && <span className="post-meta">{post.meta}</span>}
        {comments.length > 0 && (
          <div className="comments">
            {comments.map((c) => (
              <span key={c.id} className="comment">
                <strong>{c.name}</strong> {c.text} <span>· {c.time}</span>
              </span>
            ))}
          </div>
        )}
        <div className="comment-form">
          <input
            value={draft}
            placeholder={t.comment}
            maxLength={1000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                send()
              }
            }}
          />
          <button onClick={send} disabled={pending}>
            {t.post}
          </button>
        </div>
      </div>
    </article>
  )
}

export function NewPostForm({
  t,
  categoryId,
  subs,
  defaultSub,
}: {
  t: Dict
  categoryId: number
  subs: { slug: string; label: string }[]
  defaultSub?: string
}) {
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState(defaultSub || subs[0]?.slug || '')
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <div>
        <button className="btn" onClick={() => setOpen(true)}>
          <Icon name="plus" size={14} /> {t.newPost}
        </button>
      </div>
    )
  }

  const submit = (form: FormData) =>
    startTransition(async () => {
      const res = await createPost({
        category: categoryId,
        sub,
        title: String(form.get('title') || ''),
        text: String(form.get('text') || ''),
        meta: String(form.get('meta') || ''),
      })
      if (res.ok) setOpen(false)
    })

  return (
    <form className="card form-card" action={submit}>
      {subs.length > 0 && (
        <div className="filters">
          {subs.map((s) => (
            <button key={s.slug} type="button" className={`pill${sub === s.slug ? ' active' : ''}`} onClick={() => setSub(s.slug)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      <input className="input" name="title" placeholder={t.postTitle} required maxLength={200} autoFocus />
      <textarea className="input" name="text" placeholder={t.postText} maxLength={4000} />
      <input className="input" name="meta" placeholder={t.postMeta} maxLength={200} />
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          {t.cancel}
        </button>
        <button className="btn btn-navy" disabled={pending}>
          {t.publish}
        </button>
      </div>
    </form>
  )
}
