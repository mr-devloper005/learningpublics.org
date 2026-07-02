import type { CSSProperties } from 'react'

/*
  Design contract — modelled on the tubix.webflow.io reference:
  black-forest bg, neon violet primary, fresh green secondary, Bricolage
  Grotesque display + Inter Tight body, pill buttons, radius 1.25rem cards.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#020e0d',
  '--slot4-page-text': '#f6f6f4',
  '--slot4-panel-bg': '#08130f',
  '--slot4-surface-bg': '#0b1a15',
  '--slot4-muted-text': 'rgba(246,246,244,0.66)',
  '--slot4-soft-muted-text': 'rgba(246,246,244,0.44)',
  '--slot4-accent': '#7ffc58',
  '--slot4-accent-fill': '#7ffc58',
  '--slot4-accent-soft': 'rgba(127,252,88,0.14)',
  '--slot4-on-accent': '#020e0d',
  '--slot4-accent-2': '#6b45f3',
  '--slot4-accent-2-soft': 'rgba(107,69,243,0.18)',
  '--slot4-accent-3': '#f1605c',
  '--slot4-dark-bg': '#020e0d',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#0f1f18',
  '--slot4-cream': '#08130f',
  '--slot4-warm': '#0b1a15',
  '--slot4-lavender': '#0d0722',
  '--slot4-gray': '#08130f',
  '--slot4-body-gradient':
    'radial-gradient(1200px 800px at 12% -10%, rgba(127,252,88,0.10), transparent 60%), radial-gradient(1000px 700px at 100% 0%, rgba(107,69,243,0.12), transparent 55%)',
  '--editable-page-bg': '#020e0d',
  '--editable-page-text': '#f6f6f4',
  '--editable-container': '1320px',
  '--editable-border': 'rgba(255,255,255,0.10)',
  '--editable-border-strong': 'rgba(255,255,255,0.22)',
  '--editable-nav-bg': 'rgba(2,14,13,0.72)',
  '--editable-nav-text': '#f6f6f4',
  '--editable-nav-active': '#7ffc58',
  '--editable-nav-active-text': '#020e0d',
  '--editable-cta-bg': '#7ffc58',
  '--editable-cta-text': '#020e0d',
  '--editable-search-bg': '#0b1a15',
  '--editable-footer-bg': '#020e0d',
  '--editable-footer-text': '#f6f6f4',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_60px_-30px_rgba(0,0,0,0.9)]',
  shadowStrong: 'shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_30px_80px_-30px_rgba(107,69,243,0.55)]',
  overlay:
    'bg-[linear-gradient(180deg,rgba(2,14,13,0)_0%,rgba(2,14,13,0.05)_40%,rgba(2,14,13,0.82)_100%)]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10',
    sectionY: 'py-[clamp(3.75rem,10vw,8.75rem)]',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[240px] shrink-0 snap-start sm:w-[280px]',
  },
  type: {
    eyebrow:
      'editable-eyebrow inline-flex items-center gap-2 text-[var(--slot4-accent)]',
    heroTitle:
      'editable-display text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white',
    sectionTitle:
      'editable-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-white',
    body: 'text-[15px] leading-[1.65] text-[var(--slot4-muted-text)] sm:text-base',
    emphasis:
      'editable-display italic text-[var(--slot4-accent)] tracking-[-0.02em]',
  },
  surface: {
    card: `rounded-[1.25rem] border border-white/10 bg-[var(--slot4-surface-bg)] ${editablePalette.shadow}`,
    soft: `rounded-[1.25rem] border border-white/8 bg-[var(--slot4-panel-bg)]`,
    dark: `rounded-[1.25rem] bg-[var(--slot4-dark-bg)] text-white ${editablePalette.shadowStrong}`,
  },
  badge: {
    pill:
      'inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70',
    accentPill:
      'inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--slot4-accent)]',
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-[13px] font-semibold tracking-[0.02em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 hover:-translate-y-[1px] active:translate-y-0',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.02] px-6 py-3 text-[13px] font-medium tracking-[0.02em] text-white transition duration-500 hover:border-white/40 hover:bg-white/[0.06] active:scale-[0.99]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-2)] px-6 py-3 text-[13px] font-medium tracking-[0.02em] text-white transition duration-500 hover:brightness-110 hover:-translate-y-[1px]',
    ghost:
      'inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.02em] text-white/80 underline-offset-[6px] transition duration-500 hover:text-white hover:underline',
  },
  media: {
    frame:
      'relative overflow-hidden rounded-[1.25rem] bg-[var(--slot4-media-bg)] border border-white/8',
    frameFull:
      'relative overflow-hidden rounded-[1.875rem] bg-[var(--slot4-media-bg)] border border-white/8',
    ratio: 'aspect-[16/10]',
  },
  motion: {
    lift:
      'transition duration-500 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_30px_80px_-30px_rgba(107,69,243,0.6)]',
    fade: 'transition duration-500 hover:opacity-90',
    zoom: 'transition duration-[900ms] group-hover:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'Update editableRootStyle first — every component reads tokens from those CSS variables.',
  'Section rhythm uses clamp() so mobile → desktop scales without media queries.',
  'Cards live on dark surfaces with hairline white/10 borders and no heavy shadows.',
  'Buttons are pill-shaped (rounded-full) with 500ms ease-premium transitions.',
  'Wrap section headers and grids in EditableReveal for scroll-reveal stagger.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
