import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readEntries, readTopicIntros, readWeekIntros } from './content.mjs'
import { PATHS, TOPIC_KEYS, LIMITS, config } from './config.mjs'

/**
 * Turns the MDX files into two generated artefacts:
 *
 *   content/journal-index.json  — everything the pages need, server side only
 *   public/search-index.json    — a slim copy the search page fetches at runtime
 *
 * Splitting them keeps the full text (which will be megabytes in a few years)
 * out of anything the browser downloads on a normal page view.
 */

const { entries, problems } = readEntries()

if (problems.length) {
  console.error('Refusing to build an index from invalid content. Run `npm run validate`.')
  process.exit(1)
}

const { intros: topicIntros } = readTopicIntros()
const { intros: weekIntros } = readWeekIntros()

const notes = entries.filter((e) => e.type === 'note')
const articles = entries.filter((e) => e.type === 'article')

/* ------------------------------------------------------------------ topics */

const topics = {}
for (const key of TOPIC_KEYS) {
  const count = entries.filter((e) => e.topic === key).length
  topics[key] = {
    key,
    ...config.topics[key],
    count,
    // Hubs that hold almost nothing are noindexed until they have substance.
    indexable: count >= LIMITS.hubIndexThreshold,
    intro: topicIntros[key] ?? null,
  }
}

/* -------------------------------------------------------------------- tags */

const tagCounts = {}
for (const entry of entries) {
  for (const tag of entry.tags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
}
const tags = Object.entries(tagCounts)
  .map(([tag, count]) => ({ tag, count, indexable: count >= LIMITS.hubIndexThreshold }))
  .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

/* ------------------------------------------------------------------- weeks */

const weekMap = new Map()
for (const entry of entries) {
  if (!weekMap.has(entry.week)) weekMap.set(entry.week, [])
  weekMap.get(entry.week).push(entry.day)
}
const weeks = [...weekMap.entries()]
  .map(([week, days]) => {
    const inWeek = entries.filter((e) => e.week === week)
    return {
      week,
      days: days.sort((a, b) => a - b),
      count: inWeek.length,
      words: inWeek.reduce((sum, e) => sum + e.words, 0),
      from: inWeek.reduce((min, e) => (e.date < min ? e.date : min), inWeek[0].date),
      to: inWeek.reduce((max, e) => (e.date > max ? e.date : max), inWeek[0].date),
      intro: weekIntros[week] ?? null,
    }
  })
  .sort((a, b) => b.week - a.week)

/* ------------------------------------------------------------------- years */

const yearCounts = {}
for (const entry of entries) {
  const year = entry.date.slice(0, 4)
  yearCounts[year] = (yearCounts[year] ?? 0) + 1
}
const years = Object.entries(yearCounts)
  .map(([year, count]) => ({ year, count }))
  .sort((a, b) => b.year.localeCompare(a.year))

/* ------------------------------------------------------------------- stats */

const words = entries.reduce((sum, e) => sum + e.words, 0)
const latest = entries[0] ?? null
// The status strip says "LEARNING <topic>" — that should reflect the daily
// practice, so it follows the newest *note* even when an article is newer.
const latestNote = notes[0] ?? latest

// Entries per calendar date, so the activity grid on /stats needs no extra pass.
const perDate = {}
for (const entry of entries) perDate[entry.date] = (perDate[entry.date] ?? 0) + 1

const stats = {
  startDate: config.startDate,
  entries: entries.length,
  notes: notes.length,
  articles: articles.length,
  words,
  averageWords: entries.length ? Math.round(words / entries.length) : 0,
  latestDay: latest?.day ?? 0,
  latestDate: latest?.date ?? config.startDate,
  currentTopic: latestNote?.topic ?? 'python',
  milestones: entries.filter((e) => e.milestone).length,
  perDate,
}

/* ------------------------------------------------------------------- write */

const index = { entries, topics, tags, weeks, years, stats }

mkdirSync(join(PATHS.root, 'content'), { recursive: true })
writeFileSync(PATHS.index, `${JSON.stringify(index, null, 2)}\n`)

const searchIndex = entries.map((e) => ({
  slug: e.slug,
  path: e.path,
  day: e.day,
  date: e.date,
  title: e.title,
  summary: e.summary,
  topic: e.topic,
  tags: e.tags,
  // Enough body text to make search useful without shipping the whole corpus.
  text: e.plain.slice(0, 1200),
}))

mkdirSync(PATHS.public, { recursive: true })
writeFileSync(join(PATHS.public, 'search-index.json'), `${JSON.stringify(searchIndex)}\n`)

const kb = (n) => `${Math.round(n / 1024)} KB`
console.log(
  `✓ index built · ${entries.length} entries · ${kb(JSON.stringify(index).length)} server · ${kb(JSON.stringify(searchIndex).length)} search`,
)
