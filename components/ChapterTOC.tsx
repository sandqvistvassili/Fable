import Link from 'next/link'
import { chapters } from '@/lib/chapters'

// Краткое оглавление всей книги в начале главы. Сворачиваемое, без JS.
export default function ChapterTOC({ currentSlug }: { currentSlug: string }) {
  return (
    <details
      style={{
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        margin: '0 0 32px',
        fontSize: '15px',
      }}
    >
      <summary style={{ cursor: 'pointer', color: 'var(--ink-soft)' }}>
        Оглавление книги
      </summary>
      <ol style={{ margin: '12px 0 4px', paddingLeft: '1.4em' }}>
        {chapters.map((c) =>
          c.slug === currentSlug ? (
            <li key={c.slug} style={{ margin: '6px 0', color: 'var(--ink)' }}>
              {c.title}
            </li>
          ) : (
            <li key={c.slug} style={{ margin: '6px 0' }}>
              <Link
                href={`/book/${c.slug}`}
                style={{ color: 'var(--blue)', textDecoration: 'none' }}
              >
                {c.title}
              </Link>
            </li>
          ),
        )}
      </ol>
    </details>
  )
}
