import Link from 'next/link'
import type { Article } from '@/lib/blog'

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <li style={{ margin: 0 }}>
      <Link
        href={`/blog/${article.slug}`}
        style={{
          display: 'block',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 18px',
          textDecoration: 'none',
          color: 'var(--ink)',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ display: 'block', fontWeight: 500, lineHeight: 1.4 }}>{article.title}</span>
        <span
          style={{
            display: 'block',
            marginTop: '6px',
            fontSize: '15px',
            lineHeight: 1.55,
            color: 'var(--ink-soft)',
          }}
        >
          {article.description}
        </span>
      </Link>
    </li>
  )
}
