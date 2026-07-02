'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const RENAMED_TASK_LABEL: Partial<Record<string, string>> = {
  listing: 'Local Directory',
  sbm: 'Curated Links',
  article: 'Field notes',
  image: 'Gallery',
  pdf: 'Library',
  classified: 'Exchange',
  profile: 'People',
}

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-white/8 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* CTA strip */}
      <div className="border-b border-white/8">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className={dc.type.eyebrow}>Join the platform</p>
            <h3 className="editable-display mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.028em] text-white">
              Post a place, save a link, share what you know.
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={session ? '/create' : '/signup'} className={dc.button.primary}>
              {session ? 'Submit' : 'Get started'} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className={dc.button.secondary}>
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            
            <span className="editable-display text-[19px] font-semibold tracking-[-0.01em] text-white">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-[14.5px] leading-[1.7] text-white/60">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
          
        </div>

        <FooterColumn title="Discover">
          {taskLinks.map((task) => (
            <FooterLink key={task.key} href={task.route}>
              {RENAMED_TASK_LABEL[task.key] || task.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Resources">
          <FooterLink href="/search">Search</FooterLink>
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account">
          {session ? (
            <>
              <FooterLink href="/create">Submit</FooterLink>
              <button
                type="button"
                onClick={logout}
                className="text-left text-[14px] font-medium text-white/60 transition duration-500 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <FooterLink href="/login">Sign in</FooterLink>
              <FooterLink href="/signup">Get started</FooterLink>
            </>
          )}
        </FooterColumn>
      </div>

      {/* Giant brand mark bottom */}
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-[var(--editable-container)] px-5 py-10 sm:px-8 lg:px-10">
          <div className="editable-display select-none text-[clamp(3rem,15vw,12rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-/[0.04]">
            {SITE_CONFIG.name}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 px-5 py-6 text-center text-[11px] uppercase tracking-[0.22em] text-white/45 sm:px-8">
        © {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">{title}</h3>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/70 transition duration-500 hover:text-white"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-500 group-hover:opacity-100" />
    </Link>
  )
}
