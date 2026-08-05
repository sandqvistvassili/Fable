'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTerm } from '@/lib/glossary'

// Термин руководства: пунктирное подчёркивание цветом --done (у Proof — сплошное
// синее, чтобы механизмы визуально не путались). По клику раскрывается
// определение из глоссария. Карточка на span'ах — компонент живёт внутри <p>.
export default function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const term = getTerm(id)
  if (!term) return <>{children}</>

  return (
    <>
      <button
        type="button"
        className="term-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>
      {open && (
        <span
          style={{
            display: 'block',
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
            borderLeft: '3px solid var(--done)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            margin: '12px 0',
            fontSize: '15px',
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '12px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--done)',
              marginBottom: '6px',
            }}
          >
            Термин
          </span>
          <span style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>
            {term.name}
          </span>
          <span style={{ display: 'block', color: 'var(--ink-soft)' }}>{term.definition}</span>
          <Link
            href="/glossary"
            style={{ display: 'inline-block', marginTop: '8px', fontSize: '14px', color: 'var(--done)' }}
          >
            Все термины
          </Link>
        </span>
      )}
    </>
  )
}
