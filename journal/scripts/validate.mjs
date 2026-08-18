import { readEntries, readTopicIntros, readWeekIntros } from './content.mjs'
import { LIMITS } from './config.mjs'

/**
 * The gate. If this exits non-zero the site does not build.
 *
 * That is deliberate: it is the only thing standing between "write and publish"
 * and a slow drift into three hundred entries with broken metadata. Errors stop
 * the build; warnings are printed and let it through.
 */

const RED = '[31m'
const YELLOW = '[33m'
const GREEN = '[32m'
const DIM = '[2m'
const BOLD = '[1m'
const OFF = '[0m'

const { entries, allEntries, problems } = readEntries({ includeDrafts: true })
const { problems: topicProblems } = readTopicIntros()
const { problems: weekProblems } = readWeekIntros()

const errors = [...problems, ...topicProblems, ...weekProblems]
const warnings = []

for (const entry of allEntries) {
  if (entry.draft) continue

  if (entry.chars > LIMITS.linkedinWarn) {
    warnings.push({
      file: entry.file,
      message: `${entry.chars} characters of plain text — LinkedIn allows ${LIMITS.linkedinLimit}, so this is close to the edge`,
    })
  }

  if (entry.words < 60) {
    warnings.push({
      file: entry.file,
      message: `only ${entry.words} words — short is fine, but this may be too thin to say anything`,
    })
  }

  if (entry.type === 'note' && entry.words > 700) {
    warnings.push({
      file: entry.file,
      message: `${entry.words} words — this has outgrown a daily note, consider making it type: article`,
    })
  }
}

function print(list, colour, label) {
  console.log(`\n${colour}${BOLD}${label}${OFF}`)
  const byFile = new Map()
  for (const item of list) {
    if (!byFile.has(item.file)) byFile.set(item.file, [])
    byFile.get(item.file).push(item.message)
  }
  for (const [file, messages] of byFile) {
    console.log(`\n  ${BOLD}${file}${OFF}`)
    for (const message of messages) console.log(`    ${colour}•${OFF} ${message}`)
  }
}

if (errors.length) {
  print(errors, RED, `${errors.length} error${errors.length === 1 ? '' : 's'} — build stopped`)
  console.log(
    `\n${DIM}Fix the frontmatter above and run the command again. Nothing was published.${OFF}\n`,
  )
  process.exit(1)
}

if (warnings.length) {
  print(warnings, YELLOW, `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`)
  console.log(`\n${DIM}Warnings do not stop the build.${OFF}`)
}

const published = entries.filter((e) => !e.draft)
const drafts = allEntries.filter((e) => e.draft)
const words = published.reduce((sum, e) => sum + e.words, 0)

console.log(
  `\n${GREEN}${BOLD}✓ content is valid${OFF} ${DIM}·${OFF} ${published.length} published ${DIM}·${OFF} ${drafts.length} draft${drafts.length === 1 ? '' : 's'} ${DIM}·${OFF} ${words.toLocaleString('en-US')} words\n`,
)
