'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { chapters, totalMinutes } from '@/lib/chapters'

/**
 * Липкое оглавление для десктопа: все главы, текущая подсвечена,
 * рядом — время чтения. Процент прогресса живёт здесь же, а не в шапке:
 * читателю он нужен ровно тогда, когда он смотрит, сколько осталось.
 *
 * На узких экранах оглавление превращается в сворачиваемый блок над текстом,
 * чтобы не съедать первый экран.
 */
export default function ChapterSidebar({ currentSlug }: { currentSlug: string }) {
  const [progress, setProgress] = useState(0)
  const current = chapters.find((c) => c.slug === currentSlug)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 8 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <nav className="chapter-sidebar" aria-label="Оглавление руководства">
      <div className="chapter-sidebar-inner">
        <Link href="/guide" className="sidebar-title">
          Руководство
        </Link>
        <p className="sidebar-meta num">
          13 глав · {totalMinutes} мин
        </p>

        <ol className="sidebar-list">
          {chapters.map((c) => {
            const active = c.slug === currentSlug
            return (
              <li key={c.slug}>
                <Link
                  href={`/guide/${c.slug}`}
                  className={active ? 'sidebar-item is-active' : 'sidebar-item'}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="sidebar-num num">{String(c.order).padStart(2, '0')}</span>
                  <span className="sidebar-text">{c.title}</span>
                  <span className="sidebar-time num">{c.minutes}</span>
                </Link>
                {active && (
                  <div className="sidebar-progress" aria-hidden>
                    <div className="sidebar-progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {current && (
          <p className="sidebar-status num" aria-live="polite">
            Глава {current.order} · прочитано {pct}%
          </p>
        )}
      </div>
    </nav>
  )
}
