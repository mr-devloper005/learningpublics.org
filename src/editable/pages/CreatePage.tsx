'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const RENAMED_TASK_LABEL: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
  article: 'Field notes',
  image: 'Gallery',
  pdf: 'Library',
  classified: 'Exchange',
  profile: 'People',
}

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowUpRight,
}

const fieldClass =
  'rounded-[0.85rem] border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] text-white outline-none transition duration-500 placeholder:text-white/40 focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]
  const activeLabel = activeTask ? RENAMED_TASK_LABEL[activeTask.key] || activeTask.label : 'post'

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className={dc.shell.page}>
          <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
            <div className="grid gap-8 rounded-[1.875rem] border border-white/10 bg-white/[0.02] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-10">
              <div className="flex h-full min-h-72 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#0f2118] via-[#0a1a14] to-[#020e0d] text-white">
                <Lock className="h-16 w-16 text-white/70" />
              </div>
              <div className="self-center">
                <span className={dc.badge.accentPill}>{pagesContent.create.locked.badge}</span>
                <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.create.locked.title}</h1>
                <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-white/65">
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className={dc.button.primary}>
                    Sign in <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/signup" className={dc.button.secondary}>
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
          <div className="grid gap-8 rounded-[1.875rem] border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <aside>
              <span className={dc.badge.accentPill}>{pagesContent.create.hero.badge}</span>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.create.hero.title}</h1>
              <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-white/65">{pagesContent.create.hero.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`rounded-[1rem] border p-4 text-left transition duration-500 ${
                        active
                          ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] text-white'
                          : 'border-white/10 bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/25'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-[var(--slot4-accent)]' : 'text-white/70'}`} />
                      <span className="editable-display mt-3 block text-[15px] font-medium tracking-[-0.01em] text-white">
                        {RENAMED_TASK_LABEL[item.key] || item.label}
                      </span>
                      <span className="mt-1 block text-[12px] text-white/55">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">
                    Create {activeLabel}
                  </span>
                  <h2 className="editable-display mt-2 text-[24px] font-semibold tracking-[-0.02em] text-white">
                    {pagesContent.create.formTitle}
                  </h2>
                </div>
                <span className="rounded-full border border-white/12 bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                  {session.name}
                </span>
              </div>

              <div className="mt-7 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-[0.85rem] border border-[var(--slot4-accent-2)]/40 bg-[var(--slot4-accent-2)]/10 p-4 text-[var(--slot4-accent-2)]">
                  <p className="flex items-center gap-2 text-[13.5px] font-medium">
                    <CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}
                  </p>
                  <p className="mt-1 text-[13px] text-white/70">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className={dc.button.primary + ' mt-6 w-full'}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
