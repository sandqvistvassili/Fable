import Link from 'next/link'
import type { Chapter } from '@/lib/chapters'

// Связка «статья → руководство»: ведёт из частного разбора в ту главу,
// которая ставит вопрос в общую рамку.
export default function GuideCallout({ chapter }: { chapter: Chapter }) {
  return (
    <aside
      style={{
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderLeft: '3px solid var(--blue)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
        margin: '40px 0 0',
      }}
    >
      <p
        style={{
          margin: '0 0 6px',
          fontSize: '12px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--blue)',
        }}
      >
        Это часть большей картины
      </p>
      <p style={{ margin: '0 0 10px', color: 'var(--ink-soft)' }}>
        В руководстве этот вопрос разобран в общей системе — вместе с тем, что делать дальше.
      </p>
      <Link href={`/guide/${chapter.slug}`} style={{ color: 'var(--blue)', fontWeight: 500 }}>
        Глава «{chapter.title}» →
      </Link>
    </aside>
  )
}
