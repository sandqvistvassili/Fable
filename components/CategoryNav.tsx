import Link from 'next/link'
import { categories, categoryCounts } from '@/lib/blog'

// Фильтр по темам. Ссылки, а не кнопки: работает без JS и индексируется.
export default function CategoryNav({ active }: { active?: string }) {
  const counts = categoryCounts()
  return (
    <nav
      aria-label="Темы"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 28px' }}
    >
      <Link
        href="/blog"
        style={{
          padding: '7px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)',
          background: active ? 'var(--card)' : 'var(--blue)',
          color: active ? 'var(--ink-soft)' : '#fff',
          textDecoration: 'none',
          fontSize: '15px',
        }}
      >
        Все
      </Link>
      {categories.map((c) => {
        const on = active === c.id
        return (
          <Link
            key={c.id}
            href={`/blog/topic/${c.id}`}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              background: on ? 'var(--blue)' : 'var(--card)',
              color: on ? '#fff' : 'var(--ink-soft)',
              textDecoration: 'none',
              fontSize: '15px',
            }}
          >
            {c.name}{' '}
            <span className="num" style={{ opacity: 0.65, fontSize: '13px' }}>
              {counts[c.id] ?? 0}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
