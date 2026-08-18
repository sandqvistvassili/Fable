import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { PATHS, config } from './config.mjs'

/**
 * Per-entry Open Graph images, generated at build time in the Ledger style:
 * paper ground, iron-red rule, monospace day number, serif title.
 *
 * Images are only rendered when missing, so a full rebuild after two years of
 * entries redraws nothing it already has. `--force` redraws everything.
 */

const WIDTH = 1200
const HEIGHT = 630

const C = {
  ground: '#edeee9',
  ink: '#1b1d1a',
  inkMid: '#4c514a',
  inkSoft: '#767c73',
  rule: '#d2d5cb',
  accent: '#9b382c',
}

const force = process.argv.includes('--force')

const index = JSON.parse(readFileSync(PATHS.index, 'utf8'))
mkdirSync(PATHS.og, { recursive: true })

const literata = readFileSync(
  join(PATHS.root, 'node_modules', '@fontsource', 'literata', 'files', 'literata-latin-600-normal.woff'),
)
const mono = readFileSync(
  join(PATHS.root, 'node_modules', '@fontsource', 'jetbrains-mono', 'files', 'jetbrains-mono-latin-400-normal.woff'),
)

const fonts = [
  { name: 'Literata', data: literata, weight: 600, style: 'normal' },
  { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
]

function template(entry) {
  const day = String(entry.day).padStart(3, '0')
  const topic = config.topics[entry.topic]?.label ?? entry.topic

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: C.ground,
        padding: '64px 72px',
        fontFamily: 'Literata',
      },
      children: [
        // Accent rule — the ledger line.
        {
          type: 'div',
          props: { style: { width: 96, height: 6, background: C.accent, marginBottom: 40 } },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 30,
              color: C.inkSoft,
              letterSpacing: 3,
              marginBottom: 28,
            },
            children: [
              { type: 'span', props: { style: { color: C.accent }, children: `DAY ${day}` } },
              { type: 'span', props: { style: { margin: '0 20px' }, children: '·' } },
              { type: 'span', props: { children: topic.toUpperCase() } },
              { type: 'span', props: { style: { margin: '0 20px' }, children: '·' } },
              { type: 'span', props: { children: entry.date } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 68,
              lineHeight: 1.15,
              color: C.ink,
              letterSpacing: -1,
              flexGrow: 1,
            },
            children: entry.title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderTop: `2px solid ${C.rule}`,
              paddingTop: 28,
              fontFamily: 'JetBrains Mono',
              fontSize: 26,
              color: C.inkMid,
            },
            children: [
              { type: 'span', props: { children: config.author.name } },
              { type: 'span', props: { style: { color: C.inkSoft }, children: new URL(config.siteUrl).host } },
            ],
          },
        },
      ],
    },
  }
}

async function render(entry, file) {
  const svg = await satori(template(entry), { width: WIDTH, height: HEIGHT, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
  writeFileSync(file, png)
}

let drawn = 0
let kept = 0

for (const entry of index.entries) {
  const file = join(PATHS.og, `${entry.slug}.png`)
  if (!force && existsSync(file)) {
    kept += 1
    continue
  }
  await render(entry, file)
  drawn += 1
}

// Default card for the home page and anything without its own image.
const defaultFile = join(PATHS.og, 'default.png')
if (force || !existsSync(defaultFile)) {
  await render(
    {
      day: index.stats.latestDay,
      topic: index.stats.currentTopic,
      date: index.stats.latestDate,
      title: config.site.title,
      slug: 'default',
    },
    defaultFile,
  )
  drawn += 1
}

// Static export copies public/ at build start, so make sure out/ gets the
// images even though they were generated after `next build`.
const outOg = join(PATHS.root, 'out', 'og')
if (existsSync(join(PATHS.root, 'out'))) {
  mkdirSync(outOg, { recursive: true })
  for (const entry of index.entries) {
    copyFileSync(join(PATHS.og, `${entry.slug}.png`), join(outOg, `${entry.slug}.png`))
  }
  copyFileSync(defaultFile, join(outOg, 'default.png'))
}

console.log(`✓ og images · ${drawn} drawn · ${kept} kept`)
