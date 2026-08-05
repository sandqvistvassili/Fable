import Link from 'next/link'
import { articlesForChapter } from '@/lib/blog'

// Связка «руководство → статьи»: в конце главы даём разборы по её темам.
export default function ChapterArticles({ chapterSlug }: { chapterSlug: string }) {
  const list = articlesForChapter(chapterSlug)
  if (list.length === 0) return null

  return (
    <section style={{ marginTop: '48px' }}>
      <h2 style={{ fontSize: '1.15em', fontWeight: 600, margin: '0 0 6px' }}>Глубже по теме</h2>
      <p style={{ margin: '0 0 14px', fontSize: '15px', color: 'var(--mute)' }}>
        Отдельные разборы с механизмом и источниками.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map((a) => (
          <li key={a.slug} style={{ marginBottom: '8px' }}>
            <Link
              href={`/blog/${a.slug}`}
              style={{
                display: 'block',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '16px',
                lineHeight: 1.45,
              }}
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
