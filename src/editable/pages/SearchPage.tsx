import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const RENAMED_TASK_LABEL: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
  article: 'Field notes',
  image: 'Gallery',
  pdf: 'Library',
  classified: 'Exchange',
  profile: 'People',
}
const displayLabelFor = (task: TaskKey | null, fallback: string) => (task && RENAMED_TASK_LABEL[task]) || fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskCfg = SITE_CONFIG.tasks.find((item) => item.key === task)
  const taskRoute = taskCfg?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = displayLabelFor(task, taskCfg?.label || 'Post')
  const strong = index % 5 === 0

  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:border-white/25 ${strong ? 'md:col-span-2' : ''}`}
    >
      {image ? (
        <div className={`relative overflow-hidden bg-black ${strong ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,14,13,0)_45%,rgba(2,14,13,0.8))]" />
          <span className={`absolute left-4 top-4 ${dc.badge.pill} bg-black/40 backdrop-blur`}>{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        {!image ? <span className={dc.badge.pill}>{taskLabel}</span> : null}
        <h2 className="editable-display mt-4 line-clamp-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.022em] text-white">
          {post.title}
        </h2>
        {summary ? (
          <p className="mt-3 line-clamp-3 text-[14px] leading-[1.6] text-white/60">{summary}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.02em] text-white/80 underline-offset-[6px] transition duration-500 group-hover:underline">
          Open <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
          <EditableReveal>
            <div className="grid gap-8 rounded-[1.875rem] border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[0.8fr_1.2fr] lg:p-10">
              <div>
                <span className={dc.badge.accentPill}>{pagesContent.search.hero.badge}</span>
                <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.search.hero.title}</h1>
                <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-white/65">{pagesContent.search.hero.description}</p>
              </div>
              <form action="/search" className="self-end rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <input type="hidden" name="master" value="1" />
                <label className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.03] px-4 py-3">
                  <Search className="h-4 w-4 text-white/50" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder={pagesContent.search.hero.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/40"
                  />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-3">
                    <Filter className="h-4 w-4 text-white/50" />
                    <input
                      name="category"
                      defaultValue={category}
                      placeholder="Category"
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-white/40"
                    />
                  </label>
                  <select
                    name="task"
                    defaultValue={task}
                    className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-white outline-none"
                  >
                    <option value="">All surfaces</option>
                    {enabledTasks.map((item) => (
                      <option key={item.key} value={item.key}>
                        {RENAMED_TASK_LABEL[item.key] || item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className={dc.button.primary + ' mt-4 w-full'} type="submit">
                  Search
                </button>
              </form>
            </div>
          </EditableReveal>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">
                {results.length} results
              </span>
              <h2 className={`mt-3 ${dc.type.sectionTitle}`}>
                {query ? (
                  <>
                    Results for <span className={dc.type.emphasis}>“{query}”</span>
                  </>
                ) : (
                  pagesContent.search.resultsTitle
                )}
              </h2>
            </div>
            <Link href="/" className={dc.button.secondary}>
              Browse latest <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index % 6}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.02] p-10 text-center">
              <p className="editable-display text-[22px] font-semibold tracking-[-0.02em] text-white">No matches yet.</p>
              <p className="mt-3 text-[13.5px] text-white/60">Try a different keyword, surface, or category.</p>
            </div>
          )}

          {/* Search page footer ad */}
          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
