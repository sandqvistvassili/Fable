'use client'

import { useState } from 'react'
import { getProof } from '@/lib/proofs'

// Фраза с подсказкой-источником: сплошное подчёркивание цветом --blue,
// по клику под абзацем раскрывается карточка с библиографической ссылкой.
// Карточка свёрстана на span'ах, потому что живёт внутри <p>.
export default function Proof({ id, children }: { id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const proof = getProof(id)
  if (!proof) return <>{children}</>

  return (
    <>
      <button
        type="button"
        className="proof-trigger"
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
            borderLeft: '3px solid var(--blue)',
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
              color: 'var(--blue)',
              marginBottom: '6px',
            }}
          >
            Источник
          </span>
          <span style={{ display: 'block', marginBottom: '8px' }}>{proof.claim}</span>
          <span style={{ display: 'block', color: 'var(--ink-soft)' }}>{proof.source}</span>
          {proof.doi && (
            <span className="num" style={{ display: 'block', color: 'var(--mute)', fontSize: '13px', marginTop: '4px' }}>
              DOI: {proof.doi}
            </span>
          )}
          {proof.note && (
            <span style={{ display: 'block', color: 'var(--mute)', marginTop: '8px' }}>
              {proof.note}
            </span>
          )}
        </span>
      )}
    </>
  )
}
