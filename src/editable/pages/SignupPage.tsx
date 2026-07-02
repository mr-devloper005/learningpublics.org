import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1fr]`}>
          <div className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
            <h1 className="editable-display text-[24px] font-semibold tracking-[-0.02em] text-white">
              {pagesContent.auth.signup.formTitle}
            </h1>
            <EditableLocalSignupForm />
            <p className="mt-6 text-[13.5px] text-white/60">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-[var(--slot4-accent)] underline-offset-4 transition duration-500 hover:underline"
              >
                {pagesContent.auth.signup.loginCta}
              </Link>
            </p>
          </div>
          <div>
            <span className={dc.badge.accentPill}>{pagesContent.auth.signup.badge}</span>
            <h2 className={`mt-6 max-w-xl ${dc.type.heroTitle}`}>{pagesContent.auth.signup.title}</h2>
            <p className="mt-6 max-w-lg text-[16px] leading-[1.7] text-white/65">{pagesContent.auth.signup.description}</p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
