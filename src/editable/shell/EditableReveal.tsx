'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Stagger index within a group. Each unit ~= 80ms delay. */
  index?: number
  /** Extra classes on the wrapper. */
  className?: string
  /** Rootless observer offset — trigger this many px before element enters. */
  rootMargin?: string
  /** Element tag. Defaults to div. */
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'span'
  /** Custom transitionDelay override in ms. Wins over `index`. */
  delayMs?: number
}

/*
  Scroll-reveal wrapper. Hidden state applies ONLY after mount so:
   - JS-off visitors see the content instantly.
   - No FOUC on hydration; we upgrade from `is-hidden` to `is-visible` once
     the element intersects the viewport.
*/
export function EditableReveal({
  children,
  index = 0,
  className = '',
  rootMargin = '0px 0px -10% 0px',
  as: Tag = 'div',
  delayMs,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin, threshold: 0.06 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  const state = !mounted ? '' : visible ? 'is-visible' : 'is-hidden'
  const style: CSSProperties = {
    transitionDelay: `${delayMs ?? index * 80}ms`,
  }

  return (
    <Tag
      ref={ref as never}
      className={`editable-reveal ${state} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  )
}

export default EditableReveal
