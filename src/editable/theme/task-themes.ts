import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  One shared dark visual language for every task surface. Only kicker + note
  copy vary per task — palette, radius and type are unified so the whole
  site reads as one product (matches tubix.webflow.io reference).
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Bricolage Grotesque', 'Inter Tight', system-ui, sans-serif"
const BODY_FONT = "'Inter Tight', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#020e0d',
  surface: '#0b1a15',
  raised: '#08130f',
  text: '#f6f6f4',
  muted: 'rgba(246,246,244,0.66)',
  line: 'rgba(255,255,255,0.10)',
  accent: '#7ffc58',
  accentSoft: 'rgba(127,252,88,0.14)',
  onAccent: '#020e0d',
  glow: 'rgba(127,252,88,0.28)',
  radius: '1.25rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Field notes', note: 'Long reads, guides and dispatches from the community.' },
  listing: {
    ...base,
    kicker: 'Local Directory',
    note: 'Verified places, makers and services worth knowing about.',
  },
  classified: { ...base, kicker: 'Exchange', note: 'Live offers and listings the community is putting out today.' },
  image: { ...base, kicker: 'Gallery', note: 'A running visual index of standout images and photo stories.' },
  sbm: {
    ...base,
    kicker: 'Curated Links',
    note: 'Hand-picked resources and outside reading, saved for you.',
  },
  pdf: { ...base, kicker: 'Library', note: 'Downloadable references, playbooks and long-form documents.' },
  profile: { ...base, kicker: 'People', note: 'Contributors, makers and businesses building on the platform.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
