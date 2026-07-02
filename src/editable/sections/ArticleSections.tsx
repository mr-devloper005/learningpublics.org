import Link from 'next/link'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({
      ...(category && category !== 'all' ? { category } : {}),
      page: String(nextPage),
    }).toString()}`
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-[clamp(3rem,7vw,6rem)]`}>
        <EditableReveal>
          <div className="rounded-[1.875rem] border border-white/10 bg-white/[0.02] p-8 sm:p-12 lg:p-14">
            <span className={dc.badge.accentPill}>{voice.eyebrow}</span>
            <h1 className={`mt-6 max-w-5xl ${dc.type.heroTitle}`}>{voice.headline}</h1>
            <p className="mt-6 max-w-3xl text-[16px] leading-[1.7] text-white/65 sm:text-[17px]">{voice.description}</p>
            <form action={basePath} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <select
                name="category"
                defaultValue={category || 'all'}
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-[13.5px] text-white outline-none"
              >
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button className={dc.button.primary}>Filter</button>
            </form>
          </div>
        </EditableReveal>
      </section>

      <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => (
              <EditableReveal key={post.id} index={index % 6}>
                <ArticleListCard post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />
              </EditableReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.02] p-10 text-center">
            <h2 className="editable-display text-[24px] font-semibold tracking-[-0.025em] text-white">No field notes found</h2>
            <p className="mt-3 text-[13.5px] text-white/60">Try another category or return to all field notes.</p>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? (
            <Link href={pageHref(page - 1)} className={dc.button.secondary + ' !py-2 !text-[13px]'}>Previous</Link>
          ) : null}
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 editable-mono text-[12px] text-white/70">
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link href={pageHref(page + 1)} className={dc.button.secondary + ' !py-2 !text-[13px]'}>Next</Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-[clamp(3rem,6vw,5rem)]`}>
        <div className="grid gap-6 rounded-[1.875rem] border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
          <div className="min-w-0">
            <Link href="/article" className={dc.button.secondary + ' !py-2 !text-[13px]'}>
              <ChevronLeft className="h-4 w-4" /> Field notes
            </Link>
            <span className={`mt-8 ${dc.badge.accentPill}`}>{voice.eyebrow}</span>
            <h1 className={`mt-5 max-w-4xl ${dc.type.heroTitle}`}>{post?.title || pagesContent.detailPages.article.fallbackTitle}</h1>
          </div>
          <aside className="min-w-0 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-[#0f2118] via-[#0a1a14] to-[#020e0d] p-6 text-white">
            <span className={dc.type.eyebrow}>Reading note</span>
            <p className="mt-5 text-[14px] leading-[1.65] text-white/70">{voice.secondaryNote}</p>
            <Link href="/contact" className={dc.button.accent + ' mt-6'}>
              Contact <ArrowUpRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
      <section className={`${dc.shell.section} max-w-5xl pb-[clamp(3rem,7vw,6rem)] pt-6`}>
        <div className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-8 lg:p-10">
          <p className="text-[15px] leading-[1.7] text-white/70">
            {post?.summary || `Field note content for ${slug} will render through the editable detail page.`}
          </p>
        </div>
      </section>
    </main>
  )
}
