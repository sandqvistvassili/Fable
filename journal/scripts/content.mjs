import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { PATHS, TOPIC_KEYS, LIMITS, config } from './config.mjs'
import { toPlainText, firstParagraph, countWords, readingMinutes } from './plaintext.mjs'

/* ------------------------------------------------------------------ schema */

// YAML turns an unquoted `2026-09-16` into a Date object. Normalising here means
// the author can write the natural form and never think about quoting.
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date such as 2026-09-16')
    // Date.parse would quietly roll 2026-02-30 into March, so round-trip instead.
    .refine((v) => {
      const parsed = new Date(`${v}T00:00:00Z`)
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v
    }, 'is not a real calendar date'),
)

const slugSegment = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'may contain only lowercase letters, digits and hyphens')

const baseFields = {
  schemaVersion: z.literal(1),
  title: z
    .string()
    .trim()
    .min(8, 'is too short — write what you learned, not "Day 12"')
    .max(LIMITS.titleMax, `must be ${LIMITS.titleMax} characters or fewer, or search results cut it off`),
  summary: z
    .string()
    .trim()
    .min(20, 'needs to be a full sentence — it becomes the meta description')
    .max(LIMITS.summaryMax, `must be ${LIMITS.summaryMax} characters or fewer (it becomes the meta description)`),
  topic: z.enum(TOPIC_KEYS, {
    errorMap: () => ({ message: `must be one of: ${TOPIC_KEYS.join(', ')}` }),
  }),
  tags: z.array(slugSegment).max(6, 'should be six tags or fewer').default([]),
  day: z.number().int().positive('must be a positive whole number'),
  date: isoDate,
  milestone: z.boolean().default(false),
  draft: z.boolean().default(false),
  related: z.array(z.number().int().positive()).max(3, 'link at most three earlier entries').default([]),
}

export const noteSchema = z.object({ ...baseFields, type: z.literal('note') })

export const articleSchema = z.object({
  ...baseFields,
  type: z.literal('article'),
  slug: slugSegment,
})

export const entrySchema = z.discriminatedUnion('type', [noteSchema, articleSchema])

export const topicIntroSchema = z.object({
  schemaVersion: z.literal(1),
  topic: z.enum(TOPIC_KEYS),
  title: z.string().trim().min(4).max(LIMITS.titleMax),
  summary: z.string().trim().min(20).max(LIMITS.summaryMax),
})

export const weekIntroSchema = z.object({
  schemaVersion: z.literal(1),
  week: z.number().int().positive(),
  title: z.string().trim().min(4).max(LIMITS.titleMax),
  summary: z.string().trim().min(20).max(LIMITS.summaryMax),
})

/* ------------------------------------------------------------------- slugs */

export function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

export function entrySlug(fm) {
  return fm.type === 'article' ? fm.slug : `day-${fm.day}-${slugify(fm.title)}`
}

export function entryPath(fm) {
  return fm.type === 'article' ? `/guides/${entrySlug(fm)}` : `/journal/${entrySlug(fm)}`
}

/* ------------------------------------------------------------------- dates */

const DAY_MS = 86_400_000

export function weekNumber(dateStr) {
  const start = Date.parse(`${config.startDate}T00:00:00Z`)
  const then = Date.parse(`${dateStr}T00:00:00Z`)
  return Math.max(1, Math.floor((then - start) / (7 * DAY_MS)) + 1)
}

/* ------------------------------------------------------------------ errors */

export class ContentError extends Error {
  constructor(problems) {
    super(`${problems.length} content problem${problems.length === 1 ? '' : 's'} found`)
    this.name = 'ContentError'
    this.problems = problems
  }
}

function describeIssue(issue) {
  const field = issue.path.length ? issue.path.join('.') : 'frontmatter'
  return `${field} ${issue.message}`
}

/* ------------------------------------------------------------------- reader */

function listMdx(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .sort()
}

/**
 * Reads every entry, validates it, and returns both the good ones and a list of
 * human-readable problems. Nothing throws here — the caller decides whether a
 * problem is fatal, so `npm run new` can still work in a repo with one bad file.
 */
export function readEntries({ includeDrafts = false } = {}) {
  const problems = []
  const entries = []

  for (const file of listMdx(PATHS.journal)) {
    const full = join(PATHS.journal, file)
    const raw = readFileSync(full, 'utf8')
    const { data, content } = matter(raw)

    const parsed = entrySchema.safeParse(data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push({ file, message: describeIssue(issue) })
      }
      continue
    }

    const fm = parsed.data
    const body = content.trim()

    if (!body) {
      problems.push({ file, message: 'body is empty — the entry has frontmatter but no text' })
      continue
    }

    const plain = toPlainText(body)
    const words = countWords(plain)

    entries.push({
      ...fm,
      file,
      slug: entrySlug(fm),
      path: entryPath(fm),
      week: weekNumber(fm.date),
      words,
      readingMinutes: readingMinutes(words),
      excerpt: firstParagraph(plain),
      plain,
      chars: plain.length,
    })
  }

  // Duplicate and non-sequential day numbers silently corrupt prev/next links
  // and the URL scheme, so they are treated as hard errors.
  const byDay = new Map()
  for (const e of entries) {
    const seen = byDay.get(e.day)
    if (seen) {
      problems.push({
        file: e.file,
        message: `day ${e.day} is already used by ${seen.file} — day numbers must be unique`,
      })
    } else {
      byDay.set(e.day, e)
    }
  }

  const days = [...byDay.keys()].sort((a, b) => a - b)
  days.forEach((day, i) => {
    const expected = i + 1
    if (day !== expected) {
      const entry = byDay.get(day)
      problems.push({
        file: entry.file,
        message: `day ${day} breaks the sequence — expected day ${expected}. Renumber so days run 1, 2, 3 with no gaps.`,
      })
    }
  })

  const visible = includeDrafts ? entries : entries.filter((e) => !e.draft)
  visible.sort((a, b) => b.day - a.day)

  return { entries: visible, allEntries: entries, problems }
}

export function readTopicIntros() {
  const problems = []
  const intros = {}

  for (const file of listMdx(PATHS.topics)) {
    const raw = readFileSync(join(PATHS.topics, file), 'utf8')
    const { data, content } = matter(raw)
    const parsed = topicIntroSchema.safeParse(data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push({ file: `topics/${file}`, message: describeIssue(issue) })
      }
      continue
    }
    intros[parsed.data.topic] = {
      ...parsed.data,
      slug: parsed.data.topic,
      words: countWords(toPlainText(content)),
    }
  }

  return { intros, problems }
}

export function readWeekIntros() {
  const problems = []
  const intros = {}

  for (const file of listMdx(PATHS.weeks)) {
    const raw = readFileSync(join(PATHS.weeks, file), 'utf8')
    const { data, content } = matter(raw)
    const parsed = weekIntroSchema.safeParse(data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push({ file: `weeks/${file}`, message: describeIssue(issue) })
      }
      continue
    }
    intros[parsed.data.week] = {
      ...parsed.data,
      slug: String(parsed.data.week),
      words: countWords(toPlainText(content)),
    }
  }

  return { intros, problems }
}
