'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type SearchDoc = {
  slug: string
  path: string
  day: number
  date: string
  title: string
  summary: string
  topic: string
  tags: string[]
  text: string
}

/**
 * Client-side search over the slim index generated at build time. No service,
 * no queries leaving the page — the index is a static file on the same host.
 */
export default function SearchClient() {
  const [docs, setDocs] = useState<SearchDoc[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setDocs)
      .catch(() => setFailed(true))
  }, [])

  const results = useMemo(() => {
    if (!docs) return []
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return []

    return docs
      .map((doc) => {
        const haystackTitle = doc.title.toLowerCase()
        const haystackMeta = `${doc.summary} ${doc.topic} ${doc.tags.join(' ')}`.toLowerCase()
        const haystackBody = doc.text.toLowerCase()

        let score = 0
        for (const term of terms) {
          if (haystackTitle.includes(term)) score += 4
          else if (haystackMeta.includes(term)) score += 2
          else if (haystackBody.includes(term)) score += 1
          else return null // every term must match somewhere
        }
        return { doc, score }
      })
      .filter((r): r is { doc: SearchDoc; score: number } => r !== null)
      .sort((a, b) => b.score - a.score || b.doc.day - a.doc.day)
      .slice(0, 30)
      .map((r) => r.doc)
  }, [docs, query])

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search every entry…"
        aria-label="Search entries"
        autoFocus
        className="w-full max-w-[38em] rounded-[2px] border border-rule-strong bg-surface px-3 py-2 font-mach text-small text-ink outline-none placeholder:text-ink-soft focus:border-accent"
      />

      {failed ? (
        <p className="m-0 font-mach text-small text-ink-soft">
          Could not load the search index. Reload the page to try again.
        </p>
      ) : !docs ? (
        <p className="m-0 font-mach text-small text-ink-soft">Loading the index…</p>
      ) : query && !results.length ? (
        <p className="m-0 font-mach text-small text-ink-soft">Nothing matches “{query}”.</p>
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {results.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={doc.path}
                className="group grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 border-b border-rule py-2.5 no-underline hover:bg-accent-wash"
              >
                <span className="font-mach text-small text-ink-soft tnum">
                  {String(doc.day).padStart(3, '0')}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="leading-snug group-hover:text-accent">{doc.title}</span>
                  <span className="text-small text-ink-soft">{doc.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
