import Link from 'next/link'
import { chapters } from '@/lib/chapters'

/**
 * Оглавление для узких экранов: свёрнуто по умолчанию, чтобы не съедать
 * первый экран. На десктопе его заменяет липкая боковая колонка.
 */
export default function ChapterTOC({ currentSlug }: { currentSlug: string }) {
  return (
    <details className="toc-mobile">
      <summary>Оглавление · 13 глав</summary>
      <ol>
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/guide/${c.slug}`}
              aria-current={c.slug === currentSlug ? 'page' : undefined}
            >
              <span className="num" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {String(c.order).padStart(2, '0')}
              </span>
              <span>{c.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </details>
  )
}
