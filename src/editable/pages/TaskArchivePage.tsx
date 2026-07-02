import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  Tag,
  UserRound,
  CheckCircle2,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const RENAMED_TASK_LABEL: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
  article: 'Field notes',
  image: 'Gallery',
  pdf: 'Library',
  classified: 'Exchange',
  profile: 'People',
}

const displayLabelFor = (task: TaskKey, fallback: string) => RENAMED_TASK_LABEL[task] || fallback

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')
const domainInitial = (post: SitePost) => {
  const website = getField(post, ['website', 'url', 'link'])
  const source = website ? cleanDomain(website) : post.title
  return (source[0] || 'C').toUpperCase()
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-7 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase =
  'group block rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_30px_80px_-30px_rgba(107,69,243,0.55)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const displayLabel = displayLabelFor(task, taskConfig?.label || task)
  const categoryLabel =
    category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  const midpoint = Math.floor(posts.length / 2)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-white/8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[420px]"
            style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(107,69,243,0.22), transparent 70%)' }}
          />
          <div className={`relative ${dc.shell.section} py-[clamp(4rem,9vw,8rem)]`}>
            <EditableReveal>
              <span className={dc.badge.accentPill}>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tk-accent)]" />
                {theme.kicker}
              </span>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`mt-7 max-w-3xl text-balance ${dc.type.heroTitle}`}>
                {voice?.headline || `Browse ${displayLabel}`}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-white/65 sm:text-[17px]">
                {voice?.description || theme.note}
              </p>
            </EditableReveal>

            {voice?.chips?.length ? (
              <EditableReveal index={3}>
                <div className="mt-8 flex flex-wrap gap-2">
                  {voice.chips.map((chip) => (
                    <span key={chip} className={dc.badge.pill}>
                      {chip}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            <EditableReveal index={4}>
              <div className="mt-12 flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-white/60">
                  <span className="editable-mono text-white">{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'} ·{' '}
                  <span className="text-white/80">{categoryLabel}</span>
                </p>
                <form action={basePath} className="flex items-center gap-2.5">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-11 appearance-none rounded-full border border-white/12 bg-white/[0.03] pl-4 pr-10 text-[13px] font-medium text-white outline-none transition duration-500 focus:border-[var(--tk-accent)]"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  </div>
                  <button className={dc.button.primary + ' !h-11 !py-0'}>Apply</button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        {/* SBM archive gets a header ad — right after the header, before the grid */}
        {task === 'sbm' ? (
          <div className={`${dc.shell.section} py-6`}>
            <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel className="mx-auto w-full" />
          </div>
        ) : null}

        <section className={`${dc.shell.section} py-[clamp(3.5rem,7vw,6rem)]`}>
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <div key={post.id || post.slug} className="min-w-0">
                  <EditableReveal index={index % 8}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                  {/* Listing archive: single in-feed ad tucked around the midpoint */}
                  {task === 'listing' && index === midpoint && midpoint > 0 ? (
                    <div className="my-6">
                      <Ads
                        slot="in-feed"
                        size={pickRandom(getSlotSizes('in-feed'))}
                        showLabel
                        className="mx-auto w-full"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-white/12 bg-white/[0.02] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-white/50" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em] text-white">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Try another category, or check back after new {displayLabel.toLowerCase()} are published.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className={dc.button.secondary + ' !py-2 !text-[13px]'}>
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 editable-mono text-[12px] text-white/70">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className={dc.button.secondary + ' !py-2 !text-[13px]'}>
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function VerifiedChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-accent)]/35 bg-[var(--tk-accent-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--tk-accent)]">
      <CheckCircle2 className="h-3 w-3" /> Verified
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Field note')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-white/40">· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-[14px] leading-[1.6] text-white/60">{getSummary(post)}</p>
        <CardArrow label="Read" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-start gap-5 p-6 sm:p-7`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[var(--tk-raised)]">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <BriefcaseBusiness className="h-9 w-9 text-white/50" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="editable-display truncate text-[19px] font-semibold tracking-[-0.02em] text-white">
            {post.title}
          </h2>
          <VerifiedChip />
        </div>
        <p className="mt-2 line-clamp-1 text-[13.5px] leading-[1.55] text-white/60">{getSummary(post)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/55">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition duration-500 group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-[26px] font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">
          {price || 'Open offer'}
        </span>
        {condition ? <span className={dc.badge.accentPill}>{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-5 text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[13.5px] leading-[1.6] text-white/60">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-[12px] text-white/55">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Details inside'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition duration-500 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-white/8 bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:border-white/25"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(2,14,13,0.85))] opacity-80 transition duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-[17px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
            {post.title}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Curated Links: image-free, domain-identity forward
function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = getField(post, ['category']) || post.tags?.[0] || ''
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="editable-display flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] text-[28px] font-semibold tracking-[-0.02em] text-[var(--tk-accent)]">
          {domainInitial(post)}
        </div>
        <span className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/45">
          Curated · {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h2 className="editable-display mt-6 text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[13.5px] leading-[1.6] text-white/60">{getSummary(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-[11.5px] text-white/55">
        {website ? (
          <span className="inline-flex items-center gap-1.5 text-[var(--tk-accent)]">
            <Globe className="h-3.5 w-3.5" /> {cleanDomain(website)}
          </span>
        ) : (
          <span>Curated link</span>
        )}
        {category ? (
          <span className="inline-flex items-center gap-1.5 text-white/50">
            <Tag className="h-3 w-3" /> {category}
          </span>
        ) : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-6 w-6" />
        </div>
        <span className={dc.badge.pill}>{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[13.5px] leading-[1.6] text-white/60">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-accent)]">
        Open document <Download className="h-4 w-4" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-[var(--tk-raised)]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-white/50" />
        )}
      </div>
      <h2 className="editable-display mt-5 text-[17px] font-semibold tracking-[-0.02em] text-white">{post.title}</h2>
      {role ? <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.2em] text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-3 line-clamp-2 text-[13px] leading-[1.55] text-white/60">{getSummary(post)}</p>
    </Link>
  )
}
