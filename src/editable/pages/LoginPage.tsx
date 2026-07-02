import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr]`}>
          <div>
            <span className={dc.badge.accentPill}>{pagesContent.auth.login.badge}</span>
            <h1 className={`mt-6 max-w-xl ${dc.type.heroTitle}`}>{pagesContent.auth.login.title}</h1>
            <p className="mt-6 max-w-lg text-[16px] leading-[1.7] text-white/65">{pagesContent.auth.login.description}</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
            <h2 className="editable-display text-[24px] font-semibold tracking-[-0.02em] text-white">
              {pagesContent.auth.login.formTitle}
            </h2>
            <EditableLocalLoginForm />
            <p className="mt-6 text-[13.5px] text-white/60">
              New here?{' '}
              <Link
                href="/signup"
                className="font-medium text-[var(--slot4-accent)] underline-offset-4 transition duration-500 hover:underline"
              >
                {pagesContent.auth.login.createCta}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
