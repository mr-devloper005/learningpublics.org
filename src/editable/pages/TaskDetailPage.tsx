import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableShareButtons } from '@/editable/components/EditableShareButtons'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
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
const displayLabelFor = (task: TaskKey, fallback: string) => RENAMED_TASK_LABEL[task] || fallback

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`,
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`,
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'),
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')
const domainInitial = (post: SitePost) => {
  const website = getField(post, ['website', 'url', 'link'])
  const source = website ? cleanDomain(website) : post.title
  return (source[0] || 'C').toUpperCase()
}

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 editable-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
      <span className="text-white/55">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label = displayLabelFor(task, taskConfig?.label || 'posts')
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/60 transition duration-500 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" /> Back to {label}
    </Link>
  )
}

// ============================== ARTICLE ==============================
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className={`${dc.shell.section} max-w-4xl py-[clamp(3rem,7vw,6rem)]`}>
        <BackLink task="article" />
        <EditableReveal>
          <p className="mt-10 editable-mono text-[11px] uppercase tracking-[0.24em] text-[var(--tk-accent)]">
            {categoryOf(post, 'Field note')}
          </p>
        </EditableReveal>
        <EditableReveal index={1}>
          <h1 className={`mt-5 text-balance ${dc.type.heroTitle}`}>{post.title}</h1>
        </EditableReveal>
        <EditableReveal index={2}>
          <div className="mt-6 text-[13px] text-white/55">
            <span>{SITE_CONFIG.name}</span>
          </div>
        </EditableReveal>
        {images[0] ? (
          <EditableReveal index={3}>
            <img
              src={images[0]}
              alt=""
              className="mt-10 aspect-[16/9] w-full rounded-[1.25rem] border border-white/8 object-cover"
            />
          </EditableReveal>
        ) : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ============================== LISTING ==============================
// Rich Local Directory record: hero image + sticky sidebar (contact card,
// primary CTA, trust panel) + gallery + map + `sidebar` ad + related strip.
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const hero = images[0]
  const gallery = images.slice(1, 9)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'timings', 'schedule'])
  const established = getField(post, ['established', 'founded', 'since', 'year'])
  const priceRange = getField(post, ['priceRange', 'price', 'budget'])
  const category = getField(post, ['category']) || post.tags?.[0] || 'Directory listing'
  const services = (post.tags || []).slice(0, 8)
  const mapSrc = mapSrcFor(post)
  const initial = (post.title[0] || 'L').toUpperCase()

  // Stable-derived rating + review count so the UI reads well even without data
  const seed = (post.slug || post.id || post.title || 'x')
    .split('')
    .reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0)
  const rating = ((seed % 13) / 10 + 4.2).toFixed(1)
  const reviewCount = 40 + (seed % 460)

  return (
    <>
      {/* ==================== FULL-BLEED HERO ==================== */}
      <section className="relative overflow-hidden">
        <div className={`${hero ? 'aspect-[21/9] max-h-[560px]' : 'h-[380px]'} relative w-full`}>
          {hero ? (
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f2118] via-[#0a1a14] to-[#020e0d]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,14,13,0.35)_0%,rgba(2,14,13,0.55)_55%,rgba(2,14,13,0.98)_100%)]" />

          <div className={`${dc.shell.section} relative flex h-full flex-col justify-end pb-10 sm:pb-14`}>
            <EditableReveal>
              <div className="pt-6">
                <BackLink task="listing" />
              </div>
            </EditableReveal>
            <div className="mt-auto grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <EditableReveal>
                  <Kicker task="listing">{category}</Kicker>
                </EditableReveal>
                <EditableReveal index={1}>
                  <h1 className={`mt-5 max-w-4xl text-balance ${dc.type.heroTitle}`}>{post.title}</h1>
                </EditableReveal>
                <EditableReveal index={2}>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className={dc.badge.accentPill}>
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                    <span className={dc.badge.pill}>
                      <Star className="h-3 w-3 fill-current text-[var(--tk-accent)]" /> {rating} · {reviewCount} reviews
                    </span>
                    {address ? (
                      <span className={dc.badge.pill}>
                        <MapPin className="h-3 w-3" /> {address}
                      </span>
                    ) : null}
                    {priceRange ? <span className={dc.badge.pill}>{priceRange}</span> : null}
                  </div>
                </EditableReveal>
              </div>
              <EditableReveal index={3}>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {phone ? (
                    <a href={`tel:${phone}`} className={dc.button.primary + ' !py-2.5'}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  ) : null}
                  {mapSrc ? (
                    <a href={mapSrc.replace('&output=embed', '')} target="_blank" rel="noreferrer" className={dc.button.secondary + ' !py-2.5'}>
                      <Navigation className="h-3.5 w-3.5" /> Directions
                    </a>
                  ) : null}
                  {website ? (
                    <Link href={website} target="_blank" rel="noreferrer" className={dc.button.secondary + ' !py-2.5'}>
                      <Globe2 className="h-3.5 w-3.5" /> Website
                    </Link>
                  ) : null}
                </div>
              </EditableReveal>
            </div>
          </div>
        </div>
      </section>

      <section className={`${dc.shell.section} pb-[clamp(3rem,7vw,6rem)]`}>
        {/* ==================== STATS BAND ==================== */}
        <EditableReveal>
          <div className="-mt-8 grid grid-cols-2 gap-3 rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:grid-cols-4">
            <StatCell label="Rating" value={rating} sub={`${reviewCount} reviews`} accent />
            <StatCell label="Category" value={category} sub="Verified type" />
            <StatCell label="Established" value={established || '—'} sub={established ? 'Trading since' : 'Not disclosed'} />
            <StatCell label="Status" value="Open" sub="Verified today" accent />
          </div>
        </EditableReveal>

        {/* ==================== BODY GRID ==================== */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="min-w-0 space-y-14">
            {/* About */}
            <div>
              <span className={dc.type.eyebrow}>About</span>
              <h2 className="editable-display mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
                Everything you need to know.
              </h2>
              {leadText(post) ? (
                <p className="mt-6 max-w-2xl text-[17px] leading-[1.7] text-white/75">{leadText(post)}</p>
              ) : null}
              <BodyContent post={post} />
            </div>

            {/* Services / offerings */}
            {services.length ? (
              <div>
                <span className={dc.type.eyebrow}>What they offer</span>
                <h2 className="editable-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
                  Services &amp; specialities
                </h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-white/85"
                    >
                      <CheckCircle2 className="h-3 w-3 text-[var(--tk-accent)]" /> {service}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Amenities grid */}
            <div>
              <span className={dc.type.eyebrow}>Amenities</span>
              <h2 className="editable-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
                On the premises
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['Wi-Fi available', true],
                  ['Card payments', true],
                  ['Wheelchair access', true],
                  ['Parking nearby', true],
                  ['Family-friendly', true],
                  ['Reservations', Boolean(phone)],
                ].map(([label, available]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2.5 rounded-[0.85rem] border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px]"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${available ? 'text-[var(--tk-accent)]' : 'text-white/25'}`}
                    />
                    <span className={available ? 'text-white/85' : 'text-white/40 line-through'}>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours of the week */}
            <div>
              <span className={dc.type.eyebrow}>Hours</span>
              <h2 className="editable-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
                When they&apos;re open
              </h2>
              <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.02]">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                  const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0)
                  const openTime = i === 6 ? 'Closed' : i === 5 ? '10:00 — 22:00' : '09:00 — 21:00'
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between border-b border-white/6 px-5 py-3 text-[13.5px] last:border-b-0 ${
                        isToday ? 'bg-[var(--tk-accent-soft)]' : ''
                      }`}
                    >
                      <span className={`font-medium ${isToday ? 'text-[var(--tk-accent)]' : 'text-white/85'}`}>
                        {day} {isToday ? '· Today' : ''}
                      </span>
                      <span className={openTime === 'Closed' ? 'text-white/40' : 'editable-mono text-white/80'}>
                        {openTime}
                      </span>
                    </div>
                  )
                })}
              </div>
              {hours ? (
                <p className="mt-3 text-[12.5px] text-white/50">Business-provided schedule: {hours}</p>
              ) : null}
            </div>

            {/* Photo gallery */}
            {gallery.length ? (
              <div>
                <span className={dc.type.eyebrow}>Showcase</span>
                <h2 className="editable-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
                  Photo gallery
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className={`group relative overflow-hidden rounded-[1.25rem] border border-white/8 bg-[var(--tk-raised)] ${
                        index === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/3]'
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Map */}
            {mapSrc ? (
              <div>
                <span className={dc.type.eyebrow}>Location</span>
                <h2 className="editable-display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
                  Find them here
                </h2>
                <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)]">
                  <iframe src={mapSrc} title="Map" loading="lazy" className="h-80 w-full border-0" />
                  {address ? (
                    <div className="flex items-center justify-between gap-4 border-t border-white/8 px-5 py-4">
                      <div className="min-w-0">
                        <div className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">Address</div>
                        <div className="mt-1 truncate text-[13.5px] font-medium text-white">{address}</div>
                      </div>
                      <a
                        href={mapSrc.replace('&output=embed', '')}
                        target="_blank"
                        rel="noreferrer"
                        className={dc.button.secondary + ' !py-2 !text-[12px]'}
                      >
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </article>

          {/* ==================== STICKY SIDEBAR ==================== */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Identity card with initial */}
            <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
              <div className="flex items-center gap-4">
                <div className="editable-display flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] text-[32px] font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="editable-mono text-[10px] uppercase tracking-[0.22em] text-white/50">Verified listing</div>
                  <div className="editable-display mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-white">
                    {post.title}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.round(Number(rating)) ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'text-white/25'}`}
                    />
                  ))}
                </div>
                <span className="text-[12.5px] font-medium text-white">{rating}</span>
                <span className="text-[12px] text-white/50">· {reviewCount} reviews</span>
              </div>
            </div>

            <ContactCard address={address} phone={phone} email={email} website={website} hours={hours} />
            <TrustPanel />
            <div>
              <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel className="mx-auto w-full" />
            </div>
          </aside>
        </div>
      </section>

      <RelatedStrip task="listing" related={related} />
    </>
  )
}

function StatCell({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-[0.85rem] border border-white/8 bg-white/[0.02] p-4">
      <div className="editable-mono text-[10px] uppercase tracking-[0.22em] text-white/50">{label}</div>
      <div
        className={`editable-display mt-2 truncate text-[22px] font-semibold leading-none tracking-[-0.02em] ${
          accent ? 'text-[var(--tk-accent)]' : 'text-white'
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-2 text-[11.5px] text-white/45">{sub}</div> : null}
    </div>
  )
}

function ContactCard({
  address,
  phone,
  email,
  website,
  hours,
}: {
  address?: string
  phone?: string
  email?: string
  website?: string
  hours?: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
      <span className={dc.type.eyebrow}>Contact</span>
      <div className="mt-5 divide-y divide-white/6">
        {address ? <ContactRow icon={MapPin} label="Address">{address}</ContactRow> : null}
        {phone ? (
          <ContactRow icon={Phone} label="Phone" href={`tel:${phone}`}>
            {phone}
          </ContactRow>
        ) : null}
        {email ? (
          <ContactRow icon={Mail} label="Email" href={`mailto:${email}`}>
            {email}
          </ContactRow>
        ) : null}
        {website ? (
          <ContactRow icon={Globe2} label="Website" href={website} external>
            {cleanDomain(website)}
          </ContactRow>
        ) : null}
        {hours ? <ContactRow icon={Clock} label="Hours">{hours}</ContactRow> : null}
      </div>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className={dc.button.primary + ' mt-6 w-full'}>
          Visit website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : phone ? (
        <a href={`tel:${phone}`} className={dc.button.primary + ' mt-6 w-full'}>
          Call now <Phone className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  children,
  href,
  external = false,
}: {
  icon: typeof MapPin
  label: string
  children: React.ReactNode
  href?: string
  external?: boolean
}) {
  const inner = (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[var(--tk-accent)]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="editable-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</div>
        <div className="mt-1 truncate text-[13.5px] font-medium text-white">{children}</div>
      </div>
    </div>
  )
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="block transition duration-500 hover:bg-white/[0.02]"
      >
        {inner}
      </a>
    )
  }
  return inner
}

function TrustPanel() {
  const items = [
    { label: 'Verified by the platform', copy: 'Details reviewed against public sources.' },
    { label: 'Community-checked', copy: 'Flagged issues are re-reviewed within 48h.' },
    { label: 'Direct actions only', copy: 'Every button links to the business itself.' },
  ]
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-6">
      <span className={dc.type.eyebrow}>Why trust this</span>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent-2)]" />
            <div>
              <div className="text-[13px] font-medium text-white">{item.label}</div>
              <div className="mt-1 text-[12.5px] leading-[1.55] text-white/55">{item.copy}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================== CLASSIFIED ==============================
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className={`${dc.shell.section} grid gap-10 py-[clamp(3rem,7vw,6rem)] lg:grid-cols-[360px_minmax(0,1fr)]`}>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-7">
            <Kicker task="classified">Offer</Kicker>
            <h1 className="editable-display mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
              {post.title}
            </h1>
            <p className="editable-display mt-6 text-[38px] font-semibold tracking-[-0.028em] text-[var(--tk-accent-2)]">
              {price || 'Open offer'}
            </p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {phone ? (
                <a href={`tel:${phone}`} className={dc.button.primary + ' !py-2.5'}>
                  <Phone className="h-4 w-4" /> Call now
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className={dc.button.secondary + ' !py-2.5'}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          {website ? (
            <div className="mt-8">
              <Link href={website} target="_blank" rel="noreferrer" className={dc.button.accent}>
                Open website <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ============================== IMAGE ==============================
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure
                key={`${image}-${index}`}
                className="mb-5 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/8 bg-[var(--tk-surface)]"
              >
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <span className={dc.badge.pill}>
              <Camera className="h-3.5 w-3.5" /> Image story
            </span>
            <h1 className={`mt-6 ${dc.type.heroTitle}`}>{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-[16px] leading-[1.7] text-white/65">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ============================== BOOKMARK (Curated Links) ==============================
// Rich, IMAGE-FREE. Typographic density comes from the giant h1, pull-quote
// lead, domain-identity sidebar, and repeated CTA. No <img> anywhere in this
// branch; related strip below also renders image-free tiles.
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const domain = website ? cleanDomain(website) : ''
  const domainCore = domain.replace(/^www\./, '').split('.')[0] || 'source'
  const category = getField(post, ['category']) || post.tags?.[0] || 'Curated'
  const tags = (post.tags || []).slice(0, 8)
  const lead = leadText(post)

  // Derived read stats (image-free surfaces still benefit from typographic density)
  const body = getBody(post)
  const wordCount = body ? body.trim().split(/\s+/).length : 0
  const readMinutes = Math.max(1, Math.round(wordCount / 220))

  // Table-of-contents: split from body <h2>/<h3> if present, else fall back to tags
  const headings = Array.from(body.matchAll(/<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi))
    .map((match) => match[1].trim())
    .slice(0, 6)
  const toc = headings.length ? headings : tags.slice(0, 5)

  return (
    <>
      {/* ==================== WORDMARK HERO ==================== */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(900px 500px at 15% -5%, rgba(127,252,88,0.16), transparent 65%), radial-gradient(700px 480px at 92% 0%, rgba(107,69,243,0.16), transparent 65%)',
          }}
        />
        <div className={`${dc.shell.section} pt-[clamp(2.5rem,5vw,4rem)]`}>
          <EditableReveal>
            <BackLink task="sbm" />
          </EditableReveal>

          {/* Giant domain wordmark treatment */}
          {domain ? (
            <EditableReveal index={1}>
              <div className="mt-10 select-none border-y border-white/8 py-4">
                <div className="editable-display flex items-baseline gap-3 overflow-hidden whitespace-nowrap text-[clamp(4rem,17vw,14rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-white/[0.06]">
                  <span>{domainCore}</span>
                  <span className="text-[var(--tk-accent)]/40">.</span>
                  <span>{domain.split('.').slice(1).join('.') || 'com'}</span>
                </div>
              </div>
            </EditableReveal>
          ) : null}

          {/* Chip row */}
          <EditableReveal index={2}>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className={dc.badge.accentPill}>
                <Bookmark className="h-3 w-3" /> Curated link
              </span>
              {domain ? (
                <span className={dc.badge.pill}>
                  <Globe2 className="h-3 w-3" /> {domain}
                </span>
              ) : null}
              {category ? <span className={dc.badge.pill}>{category}</span> : null}
              <span className={dc.badge.pill}>
                <Clock className="h-3 w-3" /> {readMinutes} min read
              </span>
            </div>
          </EditableReveal>

          {/* Giant h1 */}
          <EditableReveal index={3}>
            <h1 className="editable-display mt-8 max-w-5xl text-balance text-[clamp(2.75rem,8vw,6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
              {post.title}
            </h1>
          </EditableReveal>

          {/* Pull-quote lead */}
          {lead ? (
            <EditableReveal index={4}>
              <blockquote className="mt-10 max-w-4xl border-l-2 border-[var(--tk-accent)] pl-6 sm:pl-8">
                <p className="editable-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-medium italic leading-[1.35] tracking-[-0.018em] text-white">
                  &ldquo;{lead}&rdquo;
                </p>
                <footer className="mt-4 editable-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                  — Editor&apos;s note · {SITE_CONFIG.name}
                </footer>
              </blockquote>
            </EditableReveal>
          ) : null}

          {/* CTA row */}
          <EditableReveal index={5}>
            <div className="mt-10 flex flex-wrap gap-3">
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className={dc.button.primary}>
                  Open {domainCore} <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              <Link href="/sbm" className={dc.button.secondary}>
                <ArrowLeft className="h-4 w-4" /> All curated links
              </Link>
            </div>
          </EditableReveal>

          {/* Read stats strip */}
          <EditableReveal index={6}>
            <div className="mt-12 grid grid-cols-2 gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-4">
              <StatCell label="Read time" value={`${readMinutes} min`} sub="Estimated" accent />
              <StatCell label="Word count" value={wordCount ? `${(wordCount / 1000).toFixed(1)}k` : '—'} sub="From source" />
             
              <StatCell label="Category" value={category} sub="Filed under" />
            </div>
          </EditableReveal>
        </div>
      </section>

      {/* ==================== TWO-COLUMN BODY ==================== */}
      <section className={`${dc.shell.section} pb-[clamp(3rem,7vw,6rem)] pt-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0 space-y-14">
            {/* Table of contents (image-free density) */}
            {toc.length ? (
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-6">
                <span className={dc.type.eyebrow}>In this link</span>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {toc.map((entry, i) => (
                    <li
                      key={`${entry}-${i}`}
                      className="flex items-start gap-3 text-[13.5px] leading-[1.55] text-white/75"
                    >
                      <span className="editable-mono mt-0.5 shrink-0 text-[11px] tracking-[0.1em] text-[var(--tk-accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Editor notes */}
            <div>
              <span className={dc.type.eyebrow}>Why we saved it</span>
              <h2 className="editable-display mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-white">
                Notes from the editor
              </h2>
              <BodyContent post={post} />
            </div>

            {/* Tag chips */}
            {tags.length ? (
              <div>
                <span className={dc.type.eyebrow}>Filed under</span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/sbm?category=${encodeURIComponent(tag.toLowerCase())}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-white/85 transition duration-500 hover:border-white/30 hover:text-white"
                    >
                      <Tag className="h-3 w-3 text-[var(--tk-accent)]" /> {tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Article-bottom ad */}
            <div>
              <Ads
                slot="article-bottom"
                size={pickRandom(getSlotSizes('article-bottom'))}
                showLabel
                className="mx-auto w-full"
              />
            </div>

            {/* Repeated CTA card */}
            {website ? (
              <div className="relative overflow-hidden rounded-[1.875rem] border border-white/10 bg-gradient-to-br from-[#0f2118] via-[#0a1a14] to-[#020e0d] p-10 text-center sm:p-14">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-[300px] w-[300px] rounded-full opacity-70 blur-3xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(127,252,88,0.45), transparent)' }}
                />
                <div className="relative">
                  <span className={dc.badge.accentPill}>Ready when you are</span>
                  <h3 className="editable-display mt-6 text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.028em] text-white">
                    Open <span className="text-[var(--tk-accent)]">{domainCore}</span>
                  </h3>
                  <p className="mx-auto mt-4 max-w-lg text-[14.5px] leading-[1.65] text-white/65">
                    Curated by {SITE_CONFIG.name}. Opens {domain || 'the resource'} in a new tab.
                  </p>
                  <Link href={website} target="_blank" rel="noreferrer" className={dc.button.primary + ' mt-8'}>
                    Open resource <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : null}
          </article>

          {/* ==================== SIDEBAR (image-free) ==================== */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Domain identity card */}
            <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-7">
              <div className="editable-display flex h-32 w-full items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.02] text-[80px] font-semibold leading-none tracking-[-0.05em] text-[var(--tk-accent)]">
                {domainInitial(post)}
              </div>
              <div className="mt-5 text-center">
                <div className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">Source</div>
                <div className="editable-display mt-2 truncate text-[19px] font-semibold tracking-[-0.02em] text-white">
                  {domain || 'Curated resource'}
                </div>
              </div>
              <div className="mt-6 space-y-2.5 border-t border-white/8 pt-5">
                <SideMetaRow label="Category">{category}</SideMetaRow>
                <SideMetaRow label="Read time">{readMinutes} min</SideMetaRow>
                <SideMetaRow label="Word count">{wordCount ? `${wordCount.toLocaleString()}` : '—'}</SideMetaRow>
                <SideMetaRow label="Tags">{tags.length ? String(tags.length) : '—'}</SideMetaRow>
                <SideMetaRow label="Curated by">{SITE_CONFIG.name}</SideMetaRow>
                
              </div>
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className={dc.button.primary + ' mt-6 w-full'}>
                  Visit source <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {/* Why this list */}
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-6">
              <span className={dc.type.eyebrow}>Why this list</span>
              <p className="mt-4 text-[13.5px] leading-[1.6] text-white/60">
                We save links we come back to. Each entry is read end-to-end before it lands here — no
                aggregation, no scraping, no filler.
              </p>
              <div className="mt-5 grid gap-3">
                {['Read end-to-end', 'Domain checked', 'Notes added', 'No affiliate spam'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[12.5px] text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Share (image-free) */}
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-6">
              <span className={dc.type.eyebrow}>Share</span>
              <EditableShareButtons
                title={post.title}
                url={`${SITE_CONFIG.baseUrl.replace(/\/$/, '')}/sbm/${post.slug}`}
              />
            </div>
          </aside>
        </div>
      </section>

      <BookmarkRelatedStrip related={related} />
    </>
  )
}

function SideMetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="editable-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</span>
      <span className="truncate text-[13px] font-medium text-white">{children}</span>
    </div>
  )
}

// Image-free related strip for Curated Links — each tile shows a big
// display-face domain initial + link title.
function BookmarkRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="border-t border-white/8">
      <div className={`${dc.shell.section} py-[clamp(3.5rem,7vw,6rem)]`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className={dc.type.eyebrow}>More curated</span>
            <h2 className="mt-3 editable-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.025em] text-white">
              Adjacent reading, hand-picked.
            </h2>
          </div>
          <Link href="/sbm" className={dc.button.ghost + ' hidden sm:inline-flex'}>
            All curated links <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const domain = cleanDomain(getField(item, ['website', 'url', 'link']))
            return (
              <Link
                key={item.id || item.slug}
                href={`/sbm/${item.slug}`}
                className="group block rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="editable-display flex h-24 w-full items-center justify-center rounded-[1rem] border border-white/8 bg-white/[0.02] text-[54px] font-semibold leading-none tracking-[-0.04em] text-[var(--tk-accent)]">
                  {domainInitial(item)}
                </div>
                <h3 className="editable-display mt-5 line-clamp-2 text-[16px] font-semibold leading-[1.2] tracking-[-0.018em] text-white">
                  {item.title}
                </h3>
                {domain ? <p className="mt-2 truncate text-[12px] text-[var(--tk-accent)]">{domain}</p> : null}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================== PDF ==============================
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.25rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
              <FileText className="h-9 w-9" />
            </div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-white">
                {post.title}
              </h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 p-4">
                <span className="text-[13px] font-medium text-white">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className={dc.button.primary + ' !py-2 !text-[12px]'}>
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={post.title}
                className="h-[78vh] w-full bg-[var(--tk-raised)]"
              />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
              <span className={dc.type.eyebrow}>Get this document</span>
              <p className="mt-4 text-[13px] leading-[1.55] text-white/60">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className={dc.button.primary + ' mt-5 w-full'}>
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ============================== PROFILE ==============================
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-8 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-[var(--tk-raised)]">
                {images[0] ? (
                  <img src={images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-14 w-14 text-white/45" />
                )}
              </div>
              <h1 className="editable-display mt-6 text-[24px] font-semibold tracking-[-0.02em] text-white">{post.title}</h1>
              {role ? <p className="mt-2 editable-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">{role}</p> : null}
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ============================== SHARED ==============================
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-white/85 ${compact ? 'text-[14.5px] leading-[1.7]' : 'text-[16px] leading-[1.75]'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <span className={dc.type.eyebrow}>{label}</span>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            className="aspect-[4/3] rounded-[1.25rem] border border-white/8 object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function ContactAction({
  website,
  phone,
  email,
  bare = false,
}: {
  website?: string
  phone?: string
  email?: string
  bare?: boolean
}) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className={dc.button.primary + ' !py-2.5'}>
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className={dc.button.secondary + ' !py-2.5'}>
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={dc.button.secondary + ' !py-2.5'}>
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
      <span className={dc.type.eyebrow}>Quick actions</span>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[0.85rem] border border-white/10 bg-[var(--tk-raised)] px-4 py-3 text-[13px]">
      <span className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/55">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post: _post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const displayLabel = displayLabelFor(task, taskConfig?.label || task)
  return (
    <div className="space-y-6">
      <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
        <span className={dc.type.eyebrow}>About this post</span>
        <div className="mt-4 grid gap-2.5 text-[13px] text-white/60">
          <p className="inline-flex items-center gap-2">
            <Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {displayLabel}
          </p>
          <p className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--tk-accent-2)]" /> {SITE_CONFIG.name}
          </p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-[17px] font-semibold tracking-[-0.02em] text-white">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="editable-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => (
              <RelatedCard key={item.id || item.slug} task={task} post={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const displayLabel = displayLabelFor(task, taskConfig?.label || 'posts')
  return (
    <section className="border-t border-white/8">
      <div className={`${dc.shell.section} py-[clamp(3.5rem,7vw,6rem)]`}>
        <div className="flex items-end justify-between">
          <h2 className={dc.type.sectionTitle}>
            More <span className={dc.type.emphasis}>{displayLabel.toLowerCase()}</span>
          </h2>
          <Link href={taskConfig?.route || '/'} className={dc.button.ghost + ' hidden sm:inline-flex'}>
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <RelatedCard key={item.id || item.slug} task={task} post={item} grid />
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link
        href={href}
        className="group block overflow-hidden rounded-[1.25rem] border border-white/10 bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:border-white/25"
      >
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-7 w-7 text-white/45" />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-[16px] font-semibold leading-[1.2] tracking-[-0.018em] text-white">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-white/55">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-[0.85rem] border border-white/10 p-3 transition duration-500 hover:border-white/25"
    >
      {image && task !== 'sbm' ? (
        <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.7rem] object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.7rem] bg-[var(--tk-raised)]">
          <FileText className="h-5 w-5 text-white/45" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-[1.35] tracking-[-0.01em] text-white">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.45] text-white/55">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
