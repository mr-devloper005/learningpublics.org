'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-14 border-t border-white/8 pt-10">
      <div className="flex items-center gap-2 editable-display text-[19px] font-semibold tracking-[-0.02em] text-white">
        <MessageCircle className="h-5 w-5 text-[var(--slot4-accent)]" /> Comments
        <span className="text-white/50">({all.length})</span>
      </div>

      <form onSubmit={submit} className="mt-6 rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-6">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="h-11 w-full rounded-full border border-white/12 bg-white/[0.03] px-4 text-[14px] text-white outline-none transition duration-500 placeholder:text-white/40 focus:border-[var(--slot4-accent)]"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          maxLength={1500}
          className="mt-3 w-full resize-y rounded-[0.85rem] border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] leading-[1.6] text-white outline-none transition duration-500 placeholder:text-white/40 focus:border-[var(--slot4-accent)]"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-2.5 text-[13px] font-semibold tracking-[0.02em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Post comment
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-3">
        {all.map((comment) => (
          <div key={comment.id} className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-5">
            <div className="flex items-center gap-3">
              <span className="editable-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[14px] font-semibold text-[var(--slot4-accent)]">
                {initial(comment.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-white">{comment.name || 'Guest'}</p>
                {comment.createdAt ? <p className="editable-mono text-[10.5px] uppercase tracking-[0.2em] text-white/45">{timeAgo(comment.createdAt)}</p> : null}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.65] text-white/80">{comment.comment}</p>
          </div>
        ))}
        {!all.length ? <p className="text-[13.5px] text-white/55">Be the first to comment.</p> : null}
      </div>
    </section>
  )
}
