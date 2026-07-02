import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

const RENAMED_TASK_LABEL: Record<string, string> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-10 text-center text-[var(--slot4-page-text)]',
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/70">
        <SearchX className="h-5 w-5" />
      </div>
      <h2 className="editable-display mt-5 text-[22px] font-semibold tracking-[-0.02em] text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-[1.6] text-white/55">{description}</p>
      <Link
        href={actionHref}
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-5 py-2.5 text-[12px] font-medium text-white/85 transition duration-500 hover:border-white/35 hover:text-white"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskKey, taskLabel = 'posts', className }: { taskKey?: string; taskLabel?: string; className?: string }) {
  const display = (taskKey && RENAMED_TASK_LABEL[taskKey]) || taskLabel
  return (
    <EmptyState
      className={className}
      title={`No ${display.toLowerCase()} available yet`}
      description={`Published ${display.toLowerCase()} will appear here automatically. The page layout stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
