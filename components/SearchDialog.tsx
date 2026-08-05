'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { chapters } from '@/lib/chapters'
import { articles } from '@/lib/blog'
import glossary from '@/content/glossary-index.json'

type Hit = {
  kind: 'chapter' | 'article' | 'term'
  title: string
  sub: string
  href: string
}

// Индекс собирается один раз на модуль: 13 глав, 282 статьи, 1047 терминов.
// Этого мало для отдельной поисковой библиотеки — хватает подстроки.
const INDEX: Hit[] = [
  ...chapters.map((c) => ({
    kind: 'chapter' as const,
    title: c.title,
    sub: `Глава ${c.order} · ${c.minutes} мин`,
    href: `/guide/${c.slug}`,
  })),
  ...articles.map((a) => ({
    kind: 'article' as const,
    title: a.title,
    sub: a.description,
    href: `/blog/${a.slug}`,
  })),
  ...(glossary.terms as { name: string; definition: string }[]).map((t) => ({
    kind: 'term' as const,
    title: t.name,
    sub: t.definition,
    href: '/glossary',
  })),
]

const KIND_LABEL: Record<Hit['kind'], string> = {
  chapter: 'Глава',
  article: 'Статья',
  term: 'Термин',
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQ('')
  }, [open])

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const starts: Hit[] = []
    const contains: Hit[] = []
    for (const h of INDEX) {
      const t = h.title.toLowerCase()
      if (t.startsWith(s)) starts.push(h)
      else if (t.includes(s) || h.sub.toLowerCase().includes(s)) contains.push(h)
      if (starts.length + contains.length > 240) break
    }
    // Главы вперёд: их всего 13, и чаще ищут именно их
    const order = { chapter: 0, article: 1, term: 2 }
    return [...starts, ...contains].sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 12)
  }, [q])

  return (
    <>
      <button type="button" className="search-trigger" onClick={() => setOpen(true)}>
        <span>Поиск</span>
        <kbd className="num">⌘K</kbd>
      </button>

      {open && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Поиск">
          <button
            type="button"
            className="search-backdrop"
            aria-label="Закрыть поиск"
            onClick={() => setOpen(false)}
          />
          <div className="search-panel">
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Глава, статья или термин"
              className="search-input"
            />
            {hits.length > 0 && (
              <ul className="search-results">
                {hits.map((h) => (
                  <li key={`${h.kind}-${h.href}-${h.title}`}>
                    <Link href={h.href} onClick={() => setOpen(false)}>
                      <span className="search-kind">{KIND_LABEL[h.kind]}</span>
                      <span className="search-title">{h.title}</span>
                      <span className="search-sub">{h.sub}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {q.trim().length >= 2 && hits.length === 0 && (
              <p className="search-empty">Ничего не нашлось</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
