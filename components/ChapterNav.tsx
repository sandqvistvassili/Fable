import Link from 'next/link'
import type { Chapter } from '@/lib/chapters'

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '14px 16px',
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  textDecoration: 'none',
  color: 'var(--ink)',
  minWidth: 0,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: 'var(--mute)',
  marginBottom: '4px',
}

// Навигация «предыдущая / следующая глава» в конце страницы.
export default function ChapterNav({ prev, next }: { prev?: Chapter; next?: Chapter }) {
  return (
    <nav
      aria-label="Навигация по главам"
      style={{
        display: 'grid',
        gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
        gap: '12px',
        marginTop: '48px',
      }}
    >
      {prev && (
        <Link href={`/book/${prev.slug}`} style={linkStyle}>
          <span style={labelStyle}>← Предыдущая</span>
          {prev.title}
        </Link>
      )}
      {next && (
        <Link href={`/book/${next.slug}`} style={{ ...linkStyle, textAlign: 'right' }}>
          <span style={labelStyle}>Следующая →</span>
          {next.title}
        </Link>
      )}
    </nav>
  )
}
