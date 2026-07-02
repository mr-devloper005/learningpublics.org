'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Directory onboarding', body: 'Add places, verify operational details, and go live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth and setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting and workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests and partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support or feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Curated link submissions', body: 'Suggest resources and outside reading that deserve a place here.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organising shelves, collections or profile-linked boards?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className={dc.shell.page}>
      <main className={`${dc.shell.section} py-[clamp(3rem,7vw,6rem)]`}>
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <EditableReveal>
              <span className={dc.badge.accentPill}>{pagesContent.contact.eyebrow}</span>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.contact.title}</h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-white/65">{pagesContent.contact.description}</p>
            </EditableReveal>
            <div className="mt-10 space-y-4">
              {lanes.map((lane, i) => (
                <EditableReveal key={lane.title} index={i + 3}>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-6">
                    <lane.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                    <h2 className="editable-display mt-4 text-[19px] font-semibold tracking-[-0.02em] text-white">{lane.title}</h2>
                    <p className="mt-2 text-[14px] leading-[1.65] text-white/60">{lane.body}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>

          <EditableReveal index={1}>
            <div className="rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] p-8">
              <h2 className="editable-display text-[24px] font-semibold tracking-[-0.02em] text-white">
                {pagesContent.contact.formTitle}
              </h2>
              <EditableContactLeadForm />
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
