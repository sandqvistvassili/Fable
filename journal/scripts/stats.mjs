import { readEntries } from './content.mjs'
import { config, TOPIC_KEYS } from './config.mjs'

/** `npm run stats` — the numbers, in the terminal, without opening the site. */

const BOLD = '[1m'
const DIM = '[2m'
const RED = '[31m'
const OFF = '[0m'

const { entries, allEntries } = readEntries()
const drafts = allEntries.filter((e) => e.draft)

if (!entries.length) {
  console.log(`\n${DIM}No published entries yet. Run \`npm run new\` to start.${OFF}\n`)
  process.exit(0)
}

const words = entries.reduce((sum, e) => sum + e.words, 0)
const latest = entries[0]
const num = (n) => n.toLocaleString('en-US')

const dates = new Set(entries.map((e) => e.date))
const DAY_MS = 86_400_000
const startMs = Date.parse(`${config.startDate}T00:00:00Z`)
const todayMs = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
const calendarDays = Math.max(1, Math.round((todayMs - startMs) / DAY_MS) + 1)

// Consecutive calendar days ending today (or yesterday — today may not be written yet).
let streak = 0
for (let ms = todayMs; ms >= startMs; ms -= DAY_MS) {
  const day = new Date(ms).toISOString().slice(0, 10)
  if (dates.has(day)) streak += 1
  else if (ms !== todayMs) break
}

console.log(`
${BOLD}Day ${latest.day}${OFF} ${DIM}·${OFF} ${latest.date}

  ${BOLD}${num(entries.length)}${OFF} entries        ${DIM}${entries.filter((e) => e.type === 'article').length} long-form${OFF}
  ${BOLD}${num(words)}${OFF} words           ${DIM}${num(Math.round(words / entries.length))} average${OFF}
  ${BOLD}${streak}${OFF} day streak
  ${BOLD}${Math.round((dates.size / calendarDays) * 100)}%${OFF} of days written  ${DIM}${dates.size} of ${calendarDays} since ${config.startDate}${OFF}
`)

console.log(`${BOLD}By topic${OFF}`)
const widest = Math.max(...TOPIC_KEYS.map((k) => k.length))
for (const key of TOPIC_KEYS) {
  const count = entries.filter((e) => e.topic === key).length
  const share = count / entries.length
  const bar = '█'.repeat(Math.round(share * 28)) || DIM + '·' + OFF
  console.log(
    `  ${key.padEnd(widest)}  ${String(count).padStart(3)}  ${DIM}${String(Math.round(share * 100)).padStart(3)}%${OFF}  ${bar}`,
  )
}

if (drafts.length) {
  console.log(`\n${RED}${drafts.length} draft${drafts.length === 1 ? '' : 's'} not published${OFF}`)
  for (const d of drafts) console.log(`  ${DIM}day ${d.day}${OFF}  ${d.title}`)
}

console.log('')
