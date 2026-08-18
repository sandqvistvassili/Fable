import index from '@/content/journal-index.json'
import type { TopicKey } from './site'
import { LIMITS } from './site'

/**
 * Typed access to the generated content index.
 *
 * The index is produced by `scripts/build-index.mjs` before every build, so the
 * shapes below mirror what that script writes. Nothing here reads the file
 * system — pages import this module and get plain data.
 */

export type EntryType = 'note' | 'article'

export type Entry = {
  schemaVersion: 1
  type: EntryType
  title: string
  summary: string
  topic: TopicKey
  tags: string[]
  day: number
  date: string
  milestone: boolean
  draft: boolean
  related: number[]
  file: string
  slug: string
  path: string
  week: number
  words: number
  readingMinutes: number
  excerpt: string
  /** Body with all markup stripped — used by the share generators. */
  plain: string
  chars: number
}

export type TopicSummary = {
  key: TopicKey
  label: string
  blurb: string
  primary: boolean
  count: number
  indexable: boolean
  intro: { title: string; summary: string; words: number } | null
}

export type TagSummary = { tag: string; count: number; indexable: boolean }

export type WeekSummary = {
  week: number
  days: number[]
  count: number
  words: number
  from: string
  to: string
  intro: { title: string; summary: string; words: number } | null
}

export type YearSummary = { year: string; count: number }

export type Stats = {
  startDate: string
  entries: number
  notes: number
  articles: number
  words: number
  averageWords: number
  latestDay: number
  latestDate: string
  currentTopic: TopicKey
  milestones: number
  perDate: Record<string, number>
}

/** Every published entry, newest day first. */
export const entries = index.entries as Entry[]

export const notes = entries.filter((e) => e.type === 'note')
export const articles = entries.filter((e) => e.type === 'article')

export const topics = index.topics as Record<TopicKey, TopicSummary>
export const tags = index.tags as TagSummary[]
export const weeks = index.weeks as WeekSummary[]
export const years = index.years as YearSummary[]
export const stats = index.stats as Stats

/** Chronological order, oldest first — for prev/next and archives. */
const byDayAscending = [...entries].sort((a, b) => a.day - b.day)

export const latestEntry: Entry | undefined = entries[0]

export function getEntry(slug: string): Entry | undefined {
  return entries.find((e) => e.slug === slug)
}

export function getEntryByDay(day: number): Entry | undefined {
  return entries.find((e) => e.day === day)
}

/**
 * Neighbours in the journal. `previous` is the older entry, `next` the newer —
 * reading order, not array order.
 */
export function neighbours(entry: Entry): { previous?: Entry; next?: Entry } {
  const i = byDayAscending.findIndex((e) => e.day === entry.day)
  if (i === -1) return {}
  return { previous: byDayAscending[i - 1], next: byDayAscending[i + 1] }
}

export function entriesByTopic(topic: TopicKey): Entry[] {
  return entries.filter((e) => e.topic === topic)
}

export function entriesByTag(tag: string): Entry[] {
  return entries.filter((e) => e.tags.includes(tag))
}

export function entriesByWeek(week: number): Entry[] {
  return entries.filter((e) => e.week === week).sort((a, b) => a.day - b.day)
}

export function entriesByYear(year: string): Entry[] {
  return entries.filter((e) => e.date.startsWith(year))
}

export function getWeek(week: number): WeekSummary | undefined {
  return weeks.find((w) => w.week === week)
}

export function getTag(tag: string): TagSummary | undefined {
  return tags.find((t) => t.tag === tag)
}

/** Hand-picked links the author added via `related: [day, …]`. */
export function relatedEntries(entry: Entry): Entry[] {
  return entry.related
    .map((day) => getEntryByDay(day))
    .filter((e): e is Entry => Boolean(e) && e!.day !== entry.day)
}

export function paginate<T>(items: T[], page: number, size = LIMITS.pageSize) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), pages)
  const start = (current - 1) * size
  return {
    items: items.slice(start, start + size),
    page: current,
    pages,
    hasPrevious: current > 1,
    hasNext: current < pages,
  }
}

/** Consecutive calendar days written, counting back from the most recent entry. */
export function currentStreak(): number {
  const written = new Set(Object.keys(stats.perDate))
  if (!written.size) return 0
  const DAY = 86_400_000
  let cursor = Date.parse(`${stats.latestDate}T00:00:00Z`)
  let streak = 0
  while (written.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1
    cursor -= DAY
  }
  return streak
}
