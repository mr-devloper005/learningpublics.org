import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <EditableReveal>
              <article className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-8 lg:p-12">
                <span className={dc.badge.accentPill}>{pagesContent.about.badge}</span>
                <h1 className={`mt-6 ${dc.type.heroTitle}`}>
                  About <span className={dc.type.emphasis}>{SITE_CONFIG.name}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-white/65">{pagesContent.about.description}</p>
                <div className="mt-8 space-y-4 text-[15px] leading-[1.7] text-white/60">
                  {pagesContent.about.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </EditableReveal>
            <aside className="space-y-4">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i + 1}>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-7">
                    <h2 className="editable-display text-[19px] font-semibold tracking-[-0.02em] text-white">{value.title}</h2>
                    <p className="mt-3 text-[14px] leading-[1.65] text-white/60">{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </aside>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
