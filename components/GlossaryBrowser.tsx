'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import glossary from '@/content/glossary-index.json'

type Entry = {
  key: string
  name: string
  definition: string
  en: string | null
  sources: string[]
  kind: string
  id?: string
}

const ALL = glossary.terms as Entry[]

const KIND_LABEL: Record<string, string> = {
  guide: 'Термин руководства',
  supplement: 'Добавка',
}

function firstLetter(name: string) {
  const c = name.trim()[0]?.toUpperCase() ?? '#'
  return /[А-ЯЁ]/.test(c) ? c : /[A-Z]/.test(c) ? 'A–Z' : '#'
}

export default function GlossaryBrowser({ articleTitles }: { articleTitles: Record<string, string> }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return ALL
    return ALL.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        (t.en && t.en.toLowerCase().includes(s)) ||
        t.definition.toLowerCase().includes(s),
    )
  }, [q])

  const groups = useMemo(() => {
    const g = new Map<string, Entry[]>()
    for (const t of filtered) {
      const l = firstLetter(t.name)
      const list = g.get(l) ?? []
      list.push(t)
      g.set(l, list)
    }
    return [...g.entries()].sort(([a], [b]) => a.localeCompare(b, 'ru'))
  }, [filtered])

  return (
    <>
      <label style={{ display: 'block', margin: '0 0 20px' }}>
        <span className="sr-only">Поиск по глоссарию</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти термин — по-русски, по-английски или по определению"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 16px',
            fontSize: '16px',
            fontFamily: 'var(--font-text)',
            color: 'var(--ink)',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      </label>

      <p style={{ color: 'var(--mute)', fontSize: '15px', margin: '0 0 24px' }}>
        {q ? 'Найдено' : 'Всего'}: <span className="num">{filtered.length}</span>
        {!q && ' терминов'}
      </p>

      {!q && (
        <nav
          aria-label="По алфавиту"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 28px' }}
        >
          {groups.map(([letter]) => (
            <a
              key={letter}
              href={`#g-${encodeURIComponent(letter)}`}
              className="num"
              style={{
                padding: '5px 10px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                background: 'var(--card)',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              {letter}
            </a>
          ))}
        </nav>
      )}

      {groups.map(([letter, items]) => (
        <section key={letter} id={`g-${encodeURIComponent(letter)}`} style={{ marginBottom: '32px' }}>
          <h2
            className="num"
            style={{
              fontSize: '1.1em',
              fontWeight: 600,
              color: 'var(--mute)',
              margin: '0 0 12px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {letter}
          </h2>
          <dl style={{ margin: 0 }}>
            {items.map((t) => {
              const src = t.sources.find((s) => articleTitles[s])
              return (
                <div
                  key={t.key}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 18px',
                    marginBottom: '10px',
                  }}
                >
                  <dt style={{ fontWeight: 600, marginBottom: '5px' }}>
                    {t.name}
                    {t.en && (
                      <span
                        className="num"
                        style={{ fontWeight: 400, color: 'var(--mute)', fontSize: '13px' }}
                      >
                        {' · '}
                        {t.en}
                      </span>
                    )}
                    {KIND_LABEL[t.kind] && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          fontWeight: 400,
                          color: 'var(--done)',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          padding: '1px 7px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {KIND_LABEL[t.kind]}
                      </span>
                    )}
                  </dt>
                  <dd style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '15px' }}>
                    {t.definition}
                    {src && (
                      <>
                        {' '}
                        <Link
                          href={`/blog/${src}`}
                          style={{ color: 'var(--blue)', whiteSpace: 'nowrap' }}
                        >
                          Разбор →
                        </Link>
                      </>
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      ))}

      {filtered.length === 0 && (
        <p style={{ color: 'var(--mute)' }}>Ничего не нашлось. Попробуй другое слово.</p>
      )}
    </>
  )
}
