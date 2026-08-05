import Link from 'next/link'
import type { Chapter } from '@/lib/chapters'

export default function ChapterNav({ prev, next }: { prev?: Chapter; next?: Chapter }) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Навигация по главам"
      className={prev && next ? 'chapter-nav has-both' : 'chapter-nav'}
    >
      {prev && (
        <Link href={`/guide/${prev.slug}`}>
          <span className="dir">← Предыдущая</span>
          <span className="name">{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link
          href={`/guide/${next.slug}`}
          style={prev ? { textAlign: 'right' } : undefined}
        >
          <span className="dir">Следующая →</span>
          <span className="name">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}
