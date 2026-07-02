import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link
      href={href}
      className={`group relative block min-w-0 overflow-hidden ${dc.media.frameFull} ${dc.motion.lift}`}
    >
      <div className="relative min-h-[520px] lg:min-h-[620px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,14,13,0.05)_0%,rgba(2,14,13,0.35)_45%,rgba(2,14,13,0.92)_100%)]" />
        <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-7 sm:p-10 lg:min-h-[620px]">
          <span className={dc.badge.accentPill}>{label}</span>
          <h3 className="editable-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.032em] text-white">
            {post.title}
          </h3>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.65] text-white/75 sm:text-base">
            {getEditableExcerpt(post, 190)}
          </p>
          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur transition duration-500 group-hover:bg-white group-hover:text-[#020e0d] group-hover:ring-white">
            Read story <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} ${dc.media.ratio}`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 backdrop-blur">
          No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="editable-display mt-3 line-clamp-3 text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
          {post.title}
        </h3>
        <p className={`mt-3 line-clamp-3 text-[14px] leading-[1.6] ${pal.softMutedText}`}>
          {getEditableExcerpt(post, 135)}
        </p>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group block min-w-0 rounded-[1.25rem] border border-white/8 bg-white/[0.02] p-5 transition duration-500 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.04]`}
    >
      <div className="flex items-start gap-4">
        <span className="editable-mono flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.02] text-[13px] text-white/80">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
            {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-2 line-clamp-2 text-[19px] font-semibold leading-[1.15] tracking-[-0.018em] text-white">
            {post.title}
          </h3>
          <p className={`mt-2 line-clamp-2 text-[13.5px] leading-[1.55] ${pal.softMutedText}`}>
            {getEditableExcerpt(post, 105)}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-5 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[240px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frame} aspect-[16/12] sm:aspect-auto sm:min-h-[200px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
        />
      </div>
      <div className="min-w-0 p-2 sm:py-4 sm:pr-5">
        <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
          Read {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-3 line-clamp-3 text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] text-white sm:text-[30px]">
          {post.title}
        </h2>
        <p className={`mt-4 line-clamp-3 text-[14.5px] leading-[1.6] ${pal.softMutedText}`}>
          {getEditableExcerpt(post, 180)}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.02em] text-white/85 underline-offset-[6px] transition duration-500 group-hover:underline">
          Open <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
