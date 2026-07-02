'use client'

import { useState } from 'react'
import { Check, Copy, Twitter } from 'lucide-react'

type Props = {
  /** Post title — used as tweet copy prefix. */
  title: string
  /** Absolute URL to share. Falls back to `window.location.href` at click time. */
  url?: string
}

/*
  Wire-up:
   - Copy → navigator.clipboard.writeText, shows "Copied" for 1.4s
   - Twitter → opens the intent URL in a new tab
  Both fall back gracefully when the clipboard API is missing.
*/
export function EditableShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const resolveUrl = () => {
    if (url) return url
    if (typeof window !== 'undefined') return window.location.href
    return ''
  }

  const handleCopy = async () => {
    const target = resolveUrl()
    if (!target) return
    try {
      await navigator.clipboard.writeText(target)
    } catch {
      // Older browsers — best-effort execCommand fallback
      const el = document.createElement('textarea')
      el.value = target
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } catch {
        /* clipboard unavailable */
      }
      document.body.removeChild(el)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const twitterHref = () => {
    const target = resolveUrl()
    const params = new URLSearchParams({ text: title, url: target })
    return `https://twitter.com/intent/tweet?${params.toString()}`
  }

  const btn =
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.02] px-2 py-2 editable-mono text-[10.5px] uppercase tracking-[0.18em] text-white/70 transition duration-500 hover:border-white/30 hover:text-white'

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button type="button" onClick={handleCopy} aria-label="Copy link" className={btn}>
        {copied ? <Check className="h-3 w-3 text-[var(--tk-accent)]" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <a
        href={twitterHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className={btn}
        onClick={(event) => {
          event.currentTarget.setAttribute('href', twitterHref())
        }}
      >
        <Twitter className="h-3 w-3" /> Twitter
      </a>
    </div>
  )
}
