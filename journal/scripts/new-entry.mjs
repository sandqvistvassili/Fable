import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { readEntries, slugify, entrySlug } from './content.mjs'
import { PATHS, TOPIC_KEYS, LIMITS } from './config.mjs'

/**
 * `npm run new` — the first thirty seconds of the daily ritual.
 *
 * Works out the day number, stamps today's date, drops in the four-part
 * template, and hands back a path. Nothing about metadata is left to memory.
 */

const BOLD = '[1m'
const DIM = '[2m'
const GREEN = '[32m'
const RED = '[31m'
const OFF = '[0m'

const args = process.argv.slice(2)

function flag(name) {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return undefined
  return args[i + 1]
}

const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))

const { allEntries } = readEntries({ includeDrafts: true })
const nextDay = allEntries.reduce((max, e) => Math.max(max, e.day), 0) + 1

const today = new Date().toISOString().slice(0, 10)

let title = positional.join(' ').trim()
let topic = flag('topic')
const isArticle = args.includes('--article')
const asDraft = args.includes('--draft')

if (!title || !topic) {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    if (!title) {
      console.log(
        `\n${DIM}What did you learn today? Write the finding, not "Day ${nextDay}".${OFF}`,
      )
      title = (await rl.question(`${BOLD}Title${OFF} ${DIM}(max ${LIMITS.titleMax} chars)${OFF}: `)).trim()
    }
    if (!topic) {
      topic = (
        await rl.question(`${BOLD}Topic${OFF} ${DIM}(${TOPIC_KEYS.join(' / ')})${OFF}: `)
      ).trim()
    }
  } finally {
    rl.close()
  }
}

if (!title) {
  console.error(`\n${RED}No title given. Nothing created.${OFF}\n`)
  process.exit(1)
}

if (title.length > LIMITS.titleMax) {
  console.error(
    `\n${RED}Title is ${title.length} characters; the limit is ${LIMITS.titleMax}.${OFF}\n${DIM}Search results cut off anything longer.${OFF}\n`,
  )
  process.exit(1)
}

if (!TOPIC_KEYS.includes(topic)) {
  console.error(
    `\n${RED}"${topic}" is not a topic.${OFF} ${DIM}Choose one of: ${TOPIC_KEYS.join(', ')}${OFF}\n`,
  )
  process.exit(1)
}

const slug = isArticle
  ? slugify(title)
  : entrySlug({ type: 'note', day: nextDay, title })

const fileName = isArticle ? `article-${slugify(title)}.mdx` : `${String(nextDay).padStart(4, '0')}-${slugify(title)}.mdx`
const fullPath = join(PATHS.journal, fileName)

if (existsSync(fullPath)) {
  console.error(`\n${RED}${fileName} already exists.${OFF}\n`)
  process.exit(1)
}

const frontmatter = [
  '---',
  'schemaVersion: 1',
  `type: ${isArticle ? 'article' : 'note'}`,
  `title: ${JSON.stringify(title)}`,
  'summary: ""',
  ...(isArticle ? [`slug: ${slug}`] : []),
  `topic: ${topic}`,
  'tags: []',
  `day: ${nextDay}`,
  `date: ${today}`,
  'milestone: false',
  `draft: ${asDraft ? 'true' : 'false'}`,
  'related: []',
  '---',
].join('\n')

const template = `
<!-- 1 · What you were doing, and what got in the way. Two or three sentences. -->


<!-- 2 · What actually happened — the confusion, the attempt, the mistake. -->


<!-- 3 · What made it click. Code is welcome, keep it to a few lines. -->


<!-- 4 · One closing line: the lesson, or the question you are taking to tomorrow. -->

`

mkdirSync(PATHS.journal, { recursive: true })
writeFileSync(fullPath, `${frontmatter}\n${template}`)

console.log(`
${GREEN}${BOLD}✓ Day ${nextDay} created${OFF}

  ${BOLD}file${OFF}   content/journal/${fileName}
  ${BOLD}url${OFF}    /journal/${slug}
  ${BOLD}topic${OFF}  ${topic}${asDraft ? `\n  ${BOLD}draft${OFF}  not published until you set draft: false` : ''}

${DIM}Write 150–300 words, fill in summary, then:${OFF}
  npm run check
  git add -A && git commit -m ${JSON.stringify(`Day ${nextDay}: ${title}`)} && git push
`)
