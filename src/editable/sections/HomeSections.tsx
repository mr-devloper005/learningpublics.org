import Link from 'next/link'
import {
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Search,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import {
  getEditablePostImage,
  postHref,
  EditorialFeatureCard,
  RailPostCard,
  CompactIndexCard,
} from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const RENAMED_TASK_LABEL: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
  article: 'Field notes',
  image: 'Gallery',
  pdf: 'Library',
  classified: 'Exchange',
  profile: 'People',
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

function taskDisplayLabel(task: { key: TaskKey; label: string }) {
  return RENAMED_TASK_LABEL[task.key] || task.label
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* ============================== HERO ============================== */

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool)
  const heroTitleParts = pagesContent.home.hero.title || [
    'A connected home for',
    'places, links and long reads.',
  ]
  const heroDescription =
    pagesContent.home.hero.description ||
    `${SITE_CONFIG.name} brings a verified local directory, curated outside links, long reads and a photo gallery into one calmer surface.`

  const stats = [
    { value: `${pool.length}+`, label: 'Posts live' },
    { value: `${SITE_CONFIG.tasks.filter((t) => t.enabled).length}`, label: 'Content surfaces' },
    { value: '24/7', label: 'Open discovery' },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* soft green + violet glow behind hero (Tubix palette lean) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(900px 620px at 12% 8%, rgba(127,252,88,0.22), transparent 60%), radial-gradient(700px 560px at 92% 20%, rgba(107,69,243,0.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(127,252,88,0.35), transparent)' }}
      />

      <div className={`${dc.shell.section} pt-[clamp(3rem,7vw,6.5rem)] pb-[clamp(3rem,7vw,6rem)]`}>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <EditableReveal>
              <span className={dc.badge.accentPill}>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
                {pagesContent.home.hero.badge || `New on ${SITE_CONFIG.name}`}
              </span>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`mt-7 text-balance ${dc.type.heroTitle}`}>
                {heroTitleParts[0]}
                {heroTitleParts[1] ? (
                  <>
                    {' '}
                    <span className={dc.type.emphasis}>{heroTitleParts[1]}</span>
                  </>
                ) : null}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-white/70 sm:text-[17px]">
                {heroDescription}
              </p>
            </EditableReveal>

            <EditableReveal index={3}>
              <form
                action="/search"
                className="mt-9 flex w-full max-w-[560px] items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] p-1.5 pl-5 backdrop-blur"
              >
                <Search className="h-4 w-4 shrink-0 text-white/60" />
                <input
                  name="q"
                  placeholder="Search directory, curated links, reads…"
                  className="w-full min-w-0 bg-transparent py-3 text-[14px] text-white outline-none placeholder:text-white/45"
                />
                <button className={`${dc.button.primary} !px-5 !py-2.5`}>
                  Search
                </button>
              </form>
            </EditableReveal>

            <EditableReveal index={4}>
              <div className="mt-10 flex items-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="editable-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.028em] text-white">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </EditableReveal>
          </div>

          {/* Right column — collage in a rounded frame */}
          <EditableReveal index={2} className="relative">
            <div className={`${dc.media.frameFull} aspect-[4/5] w-full`}>
              <EditableHeroCollage images={heroImages} />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,14,13,0)_45%,rgba(2,14,13,0.75)_100%)]" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">Latest on {SITE_CONFIG.name}</p>
                  <p className="editable-display mt-1 text-[19px] font-medium tracking-[-0.02em] text-white">
                    Fresh posts across every surface
                  </p>
                </div>
                <Link href={primaryRoute} className={dc.button.accent + ' !px-4 !py-2 !text-[12px]'}>
                  Explore <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </EditableReveal>
        </div>
      </div>

      <BrowseByCategory primaryTask={primaryTask} primaryRoute={primaryRoute} posts={posts} timeSections={timeSections} />
    </section>
  )
}

/* ======================== BROWSE BY CATEGORY ======================== */

function BrowseByCategory({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  if (!categories.length) return null
  return (
    <div className="border-t border-white/8 bg-[rgba(255,255,255,0.02)]">
      <div className={`${dc.shell.section} py-14 sm:py-16`}>
        <div className="flex items-end justify-between gap-6">
          <EditableReveal>
            <div>
              <span className={dc.type.eyebrow}>Content surfaces</span>
              <h2 className="mt-4 editable-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.022em] text-white">
                One platform, several ways in.
              </h2>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <Link href={primaryRoute} className={`${dc.button.ghost} hidden sm:inline-flex`}>
              See all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </EditableReveal>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((task, i) => {
            const Icon = taskIcon[task.key] || FileText
            return (
              <EditableReveal key={task.key} index={i}>
                <Link
                  href={task.route}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-5 transition duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.05]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/85 transition duration-500 group-hover:border-[var(--slot4-accent)]/60 group-hover:text-[var(--slot4-accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="editable-display block text-[15px] font-medium tracking-[-0.01em] text-white">
                    {taskDisplayLabel(task)}
                  </span>
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ============================ STORY RAIL ============================ */

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null
  const rail = pool.slice(0, 10)

  return (
    <section className="border-t border-white/8">
      <div className={`${dc.shell.section} py-[clamp(3.5rem,7vw,6rem)]`}>
        <div className="flex items-end justify-between gap-6">
          <EditableReveal>
            <div>
              <span className={dc.type.eyebrow}>In rotation</span>
              <h2 className={`mt-4 ${dc.type.sectionTitle}`}>
                Currently{' '}
                <span className={dc.type.emphasis}>trending</span> across the platform.
              </h2>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <Link href={primaryRoute} className={`${dc.button.ghost} hidden sm:inline-flex`}>
              See feed <ArrowUpRight className="h-4 w-4" />
            </Link>
          </EditableReveal>
        </div>

        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rail.map((post, i) => (
            <EditableReveal key={post.id || post.slug} index={i} className="shrink-0 snap-start">
              <div className="w-[280px] sm:w-[320px]">
                <RailPostCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========================= MAGAZINE SPLIT ========================= */

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null
  const feature = pool[0]
  const supporting = pool.slice(1, 5)

  return (
    <section className="border-t border-white/8 bg-[rgba(255,255,255,0.015)]">
      <div className={`${dc.shell.section} py-[clamp(4rem,8vw,7rem)]`}>
        <div className="mb-12 flex items-end justify-between gap-6">
          <EditableReveal>
            <div className="max-w-2xl">
              <span className={dc.type.eyebrow}>Editorial</span>
              <h2 className={`mt-4 ${dc.type.sectionTitle}`}>
                Long reads worth <span className={dc.type.emphasis}>your evening</span>.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.7] text-white/60">
                Field notes, playbooks and community writing surfaced from across the platform.
              </p>
            </div>
          </EditableReveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <EditableReveal>
            <EditorialFeatureCard
              post={feature}
              href={postHref(primaryTask, feature, primaryRoute)}
              label="Feature"
            />
          </EditableReveal>
          <div className="grid gap-4 content-start">
            {supporting.map((post, i) => (
              <EditableReveal key={post.id || post.slug} index={i + 1}>
                <CompactIndexCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
              </EditableReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ======================= TIME COLLECTIONS ======================= */

const sectionCopy: Record<string, { eyebrow: string; title: string; emphasis: string }> = {
  spotlight: { eyebrow: 'This week', title: 'Fresh in the last', emphasis: '7 days' },
  browse: { eyebrow: 'This month', title: 'What people are', emphasis: 'saving now' },
  index: { eyebrow: 'Evergreen', title: 'Timeless from the', emphasis: 'archive' },
}

function TimeCollectionCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} aspect-[16/10]`}>
        <img
          src={image}
          alt={post.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur">
          <Camera className="h-3 w-3" /> {post.tags?.[0] || 'Post'}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="editable-display line-clamp-2 text-[19px] font-semibold leading-[1.15] tracking-[-0.018em] text-white">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 flex-1 text-[13.5px] leading-[1.6] text-white/55">
          {getExcerpt(post, 110)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.02em] text-white/85 underline-offset-[6px] transition duration-500 group-hover:underline">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to', emphasis: 'explore' }
        return (
          <section key={section.key} className="border-t border-white/8">
            <div className={`${dc.shell.section} py-[clamp(3.5rem,7vw,6rem)]`}>
              <div className="flex items-end justify-between gap-6">
                <EditableReveal>
                  <div>
                    <span className={dc.type.eyebrow}>{copy.eyebrow}</span>
                    <h2 className={`mt-4 ${dc.type.sectionTitle}`}>
                      {copy.title} <span className={dc.type.emphasis}>{copy.emphasis}</span>.
                    </h2>
                  </div>
                </EditableReveal>
                <EditableReveal index={1}>
                  <Link href={section.href || primaryRoute} className={`${dc.button.ghost} hidden sm:inline-flex`}>
                    See all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </EditableReveal>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i}>
                    <TimeCollectionCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ============================== CTA ============================== */

export function EditableHomeCta() {
  return (
    <section id="get-app" className="scroll-mt-24 border-t border-white/8">
      <div className={`${dc.shell.section} py-[clamp(4rem,8vw,7rem)]`}>
        <EditableReveal>
          <div className="relative overflow-hidden rounded-[1.875rem] border border-white/10 bg-gradient-to-br from-[#0f2118] via-[#0a1a14] to-[#020e0d] p-10 sm:p-14 lg:p-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-[520px] w-[520px] rounded-full opacity-80 blur-3xl"
              style={{ background: 'radial-gradient(closest-side, rgba(127,252,88,0.45), transparent)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
              style={{ background: 'radial-gradient(closest-side, rgba(107,69,243,0.35), transparent)' }}
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <span className={dc.badge.accentPill}>Join the platform</span>
                <h2 className="editable-display mt-6 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.032em] text-white">
                  Add a place. Save a link.{' '}
                  <span className={dc.type.emphasis}>Share what you know.</span>
                </h2>
                <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-white/70">
                  {SITE_CONFIG.name} is built for people who want a calmer surface to discover local places, curated
                  outside reading and long-form community writing. Post yours in a minute.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/create" className={dc.button.accent}>
                  Submit a post <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className={dc.button.secondary}>
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
