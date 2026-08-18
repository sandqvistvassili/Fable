'use client'

import { useEffect, useMemo, useState } from 'react'

/**
 * The writing desk. Local-only: talks to /admin/api, which exists solely under
 * `next dev`. Left column — the form; right column — a live preview of the
 * entry and of the LinkedIn character budget.
 */

type FileEntry = { file: string; content: string }

const TOPICS = ['python', 'swedish', 'english', 'security', 'life'] as const
const TITLE_MAX = 60
const SUMMARY_MAX = 160
const LINKEDIN_LIMIT = 3000
const LINKEDIN_WARN = 2800

function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

function stripMarkdown(body: string): string {
  return body
    .replace(/^```[^\n]*\n([\s\S]*?)^```\s*$/gm, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '— ')
    .replace(/(\*\*|__|\*|_)/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function AdminClient() {
  const [existing, setExisting] = useState<FileEntry[]>([])
  const [nextDay, setNextDay] = useState(1)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [topic, setTopic] = useState<string>('python')
  const [tags, setTags] = useState('')
  const [milestone, setMilestone] = useState(false)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    fetch('/admin/api')
      .then((r) => r.json())
      .then((data: { files: FileEntry[] }) => {
        setExisting(data.files)
        const days = data.files
          .map((f) => Number(f.content.match(/^day:\s*(\d+)/m)?.[1] ?? 0))
          .filter(Boolean)
        setNextDay(days.length ? Math.max(...days) + 1 : 1)
      })
      .catch(() => setStatus('Could not reach the dev API — is `next dev` running?'))
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const slug = title ? `day-${nextDay}-${slugify(title)}` : ''
  const fileName = title ? `${String(nextDay).padStart(4, '0')}-${slugify(title)}.mdx` : ''

  const plain = useMemo(() => stripMarkdown(body), [body])
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0
  const linkedinLength = plain
    ? `Day ${nextDay} — ${topic}\n\n${title}.\n\n${plain}\n\n#tags`.length
    : 0

  const problems: string[] = []
  if (title && title.length > TITLE_MAX) problems.push(`Title is ${title.length}/${TITLE_MAX} characters.`)
  if (summary && summary.length > SUMMARY_MAX) problems.push(`Summary is ${summary.length}/${SUMMARY_MAX} characters.`)
  if (summary && summary.length < 20 && summary.length > 0) problems.push('Summary needs to be a full sentence.')
  if (linkedinLength > LINKEDIN_LIMIT) problems.push('Too long for a LinkedIn post — trim before saving.')

  const ready = title.length >= 8 && summary.length >= 20 && body.trim().length > 0 && !problems.length

  const mdx = useMemo(() => {
    const tagList = tags
      .split(',')
      .map((t) => slugify(t.trim()))
      .filter(Boolean)
    return [
      '---',
      'schemaVersion: 1',
      'type: note',
      `title: ${JSON.stringify(title)}`,
      `summary: ${JSON.stringify(summary)}`,
      `topic: ${topic}`,
      `tags: [${tagList.join(', ')}]`,
      `day: ${nextDay}`,
      `date: ${today}`,
      `milestone: ${milestone}`,
      'draft: false',
      'related: []',
      '---',
      '',
      body.trim(),
      '',
    ].join('\n')
  }, [title, summary, topic, tags, nextDay, today, milestone, body])

  async function save() {
    setStatus('Saving…')
    const res = await fetch('/admin/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: fileName, content: mdx }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus(`Saved content/journal/${data.file}. Now: npm run check, then commit and push.`)
    } else {
      setStatus(`Save failed: ${data.error}`)
    }
  }

  const label = 'font-mach text-micro uppercase tracking-[0.1em] text-ink-soft'
  const input =
    'w-full rounded-[2px] border border-rule-strong bg-surface px-3 py-2 font-mach text-small text-ink outline-none focus:border-accent'

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ------------------------------------------------------------ form */}
      <div className="flex flex-col gap-4">
        <p className="m-0 flex flex-wrap gap-x-4 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
          <span className="font-semibold text-accent">Day {String(nextDay).padStart(3, '0')}</span>
          <span>{today}</span>
          <span>{existing.length} existing entries</span>
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className={label}>
            Title — what you learned, not “Day {nextDay}”{' '}
            <span className="tnum">
              {title.length}/{TITLE_MAX}
            </span>
          </label>
          <input
            id="title"
            className={input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What finally made list comprehensions click"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="summary" className={label}>
            Summary — one sentence, becomes the meta description{' '}
            <span className="tnum">
              {summary.length}/{SUMMARY_MAX}
            </span>
          </label>
          <input
            id="summary"
            className={input}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="I rewrote the same loop four times before I realised…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="topic" className={label}>
              Topic
            </label>
            <select
              id="topic"
              className={input}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="tags" className={label}>
              Tags — comma separated
            </label>
            <input
              id="tags"
              className={input}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="lists, readability"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 font-mach text-small text-ink-mid">
          <input
            type="checkbox"
            checked={milestone}
            onChange={(e) => setMilestone(e.target.checked)}
            className="accent-[#9b382c]"
          />
          Milestone entry ◆
        </label>

        <div className="flex flex-col gap-1">
          <label htmlFor="body" className={label}>
            Entry — 150–300 words in English{' '}
            <span className="tnum">{words} words</span>
          </label>
          <textarea
            id="body"
            className={`${input} min-h-[20rem] font-read text-step-0 leading-relaxed`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              'What were you doing, and what got in the way?\n\nWhat actually happened?\n\nWhat made it click?\n\nOne closing line.'
            }
          />
        </div>

        {problems.length ? (
          <ul className="m-0 flex list-none flex-col gap-1 p-0 font-mach text-small text-accent">
            {problems.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={!ready}
            className="cursor-pointer rounded-[2px] border border-accent bg-accent px-4 py-2 font-mach text-small uppercase tracking-[0.08em] text-surface disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          >
            Save entry
          </button>
          <span className="font-mach text-small text-ink-soft" aria-live="polite">
            {status}
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------- preview */}
      <div className="flex flex-col gap-4">
        <div className="rounded-[3px] border border-rule bg-surface p-5">
          <p className="m-0 mb-3 flex flex-wrap gap-x-4 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
            <span className="font-semibold text-accent">Day {String(nextDay).padStart(3, '0')}</span>
            <span>{topic}</span>
            <span>{words} words</span>
          </p>
          <h2 className="m-0 mb-2 text-step-2 font-semibold leading-tight tracking-tight">
            {title || <span className="text-ink-soft">Title appears here</span>}
          </h2>
          <p className="m-0 mb-4 font-read text-step-0 italic text-ink-mid">
            {summary || <span className="text-ink-soft">Summary appears here</span>}
          </p>
          <div className="whitespace-pre-wrap font-read text-step-0 leading-relaxed">
            {body || <span className="text-ink-soft">The entry appears here as you type.</span>}
          </div>
        </div>

        <div className="rounded-[3px] border border-rule bg-sunk px-4 py-3 font-mach text-small tnum">
          <span
            className={
              linkedinLength > LINKEDIN_LIMIT
                ? 'text-accent font-semibold'
                : linkedinLength > LINKEDIN_WARN
                  ? 'text-accent'
                  : 'text-ink-mid'
            }
          >
            LinkedIn: {linkedinLength.toLocaleString('en-US')} / {LINKEDIN_LIMIT.toLocaleString('en-US')}
          </span>
          <span className="ml-4 text-ink-soft">url: /journal/{slug || '…'}</span>
        </div>

        <p className="m-0 font-mach text-micro text-ink-soft">
          This desk exists only on localhost while `next dev` runs. It writes a normal MDX file —
          the same one `npm run new` would create — so everything still goes through validation and
          git.
        </p>
      </div>
    </div>
  )
}
