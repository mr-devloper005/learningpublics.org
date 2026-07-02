'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const inputClass =
  'h-11 rounded-full border border-white/12 bg-white/[0.03] px-4 text-[14px] text-white outline-none transition duration-500 placeholder:text-white/40 focus:border-[var(--slot4-accent)]'

export function EditableContactLeadForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Unable to send your message.')
      setStatus('success')
      setMessage(data?.message || 'Thanks. Your message has been received.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7">
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="name" label="Full name" placeholder="Your name" required />
        <Field name="email" type="email" label="Email address" placeholder="you@example.com" required />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field name="phone" label="Phone number" placeholder="Optional" />
        <Field name="subject" label="Subject" placeholder="How can we help?" />
      </div>
      <label className="mt-3 grid gap-2 editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">
        Message
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us what you need help with…"
          className="rounded-[0.85rem] border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] leading-[1.6] text-white outline-none transition duration-500 placeholder:text-white/40 focus:border-[var(--slot4-accent)]"
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {message ? (
        <div
          className={`mt-5 flex items-start gap-3 rounded-[0.85rem] border px-4 py-3 text-[13px] ${
            status === 'success'
              ? 'border-[var(--slot4-accent-2)]/40 bg-[var(--slot4-accent-2)]/10 text-[var(--slot4-accent-2)]'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span>{message}</span>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 text-[13px] font-semibold tracking-[0.02em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send message
      </button>
    </form>
  )
}

function Field({ name, label, type = 'text', placeholder, required = false }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 editable-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
    </label>
  )
}
