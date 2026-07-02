'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Navbar contains NO task-archive links. Only:
    - Logo → /
    - About, Contact
    - Search icon → /search
    - Auth actions (Sign in / Get started · Submit / Logout)
  Mobile menu mirrors the same links.
*/
const STATIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(2,14,13,0.72)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
          
          <span className="hidden min-w-0 md:block">
            <span className="editable-display block max-w-[220px] truncate text-[17px] font-semibold leading-none tracking-[-0.01em] text-white">
              {SITE_CONFIG.name}
            </span>
            <span className="mt-1 block max-w-[220px] truncate text-[10px] font-medium uppercase tracking-[0.24em] text-white/50">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {STATIC_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition duration-500 ${
                  active
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/65 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition duration-500 hover:border-white/30 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full border border-white/18 bg-white/[0.02] px-4 py-2 text-[12px] font-medium tracking-[0.02em] text-white/85 transition duration-500 hover:border-white/40 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-[12px] font-medium tracking-[0.02em] text-white/60 transition duration-500 hover:text-white sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-white/18 bg-white/[0.02] px-4 py-2 text-[12px] font-medium tracking-[0.02em] text-white/85 transition duration-500 hover:border-white/40 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-[12px] font-semibold tracking-[0.02em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 hover:-translate-y-[1px] sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition duration-500 hover:border-white/30 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/8 bg-[rgba(2,14,13,0.94)] px-5 py-6 lg:hidden">
          <div className="grid gap-1">
            {[
              { label: 'Home', href: '/' },
              ...STATIC_NAV,
              ...(session
                ? [{ label: 'Submit', href: '/create' }]
                : [
                    { label: 'Sign in', href: '/login' },
                    { label: 'Get started', href: '/signup' },
                  ]),
            ].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[14px] font-medium tracking-[0.01em] transition duration-500 ${
                    active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
