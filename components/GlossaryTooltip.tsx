'use client'

import { useState, useRef, useId } from 'react'
import glossary from '@/content/glossary-index.json'

type Entry = {
  key: string
  name: string
  definition: string
  en: string | null
  sources: string[]
  kind: string
}

const BY_KEY = new Map((glossary.terms as Entry[]).map((t) => [t.key, t]))

// Термин из глоссария в тексте: пунктирное подчёркивание, определение
// раскрывается по наведению на десктопе и по касанию на телефоне.
// Компонент подставляется автоматически при сборке (см. lib/remark-glossary.mjs).
export default function GlossaryTooltip({
  k,
  children,
}: {
  k: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()
  const entry = BY_KEY.get(k)

  if (!entry) return <>{children}</>

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  // Небольшая задержка, чтобы подсказка не гасла при переводе курсора на неё
  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        className="glossary-trigger"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="glossary-popup"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <span className="glossary-popup-name">
            {entry.name}
            {entry.en && <span className="glossary-popup-en"> · {entry.en}</span>}
          </span>
          <span className="glossary-popup-def">{entry.definition}</span>
        </span>
      )}
    </span>
  )
}
