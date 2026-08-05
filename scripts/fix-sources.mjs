// Разводит источники статей на два списка:
//   1) те, на которые в тексте есть ссылка [n] — остаются нумерованными
//   2) те, на которые ссылки нет — переезжают в «Дополнительное чтение»
//
// Скрипт ничего не решает по смыслу: он лишь смотрит, упомянут ли номер
// в тексте. Перенумерация оставшихся делается сквозной, ссылки в тексте
// правятся синхронно.
//
// Запуск: node scripts/fix-sources.mjs

import fs from 'node:fs'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'content/blog')
const HEADING = '## Научные источники'
const FURTHER = '**Дополнительное чтение**'

let touched = 0
let moved = 0

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.mdx'))) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, 'utf8')
  const at = raw.indexOf(HEADING)
  if (at === -1) continue

  const body = raw.slice(0, at)
  const tail = raw.slice(at + HEADING.length)

  // Уже обработанные файлы не трогаем повторно
  if (tail.includes(FURTHER)) continue

  const entries = [...tail.matchAll(/^(\d+)\. (.+)$/gm)].map((m) => ({
    num: Number(m[1]),
    text: m[2].trim(),
  }))
  if (entries.length === 0) continue

  const used = new Set([...body.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])))
  const kept = entries.filter((e) => used.has(e.num))
  const orphans = entries.filter((e) => !used.has(e.num))
  if (orphans.length === 0) continue

  // Сквозная перенумерация оставшихся + синхронная правка ссылок в тексте
  const renumber = new Map(kept.map((e, i) => [e.num, i + 1]))
  const newBody = body.replace(/\[(\d+)\]/g, (m, n) => {
    const to = renumber.get(Number(n))
    return to ? `[${to}]` : m
  })

  const parts = [`${HEADING}\n`]
  if (kept.length) {
    parts.push('\n' + kept.map((e, i) => `${i + 1}. ${e.text}`).join('\n') + '\n')
  }
  parts.push(`\n${FURTHER}\n\n` + orphans.map((e) => `- ${e.text}`).join('\n') + '\n')

  fs.writeFileSync(p, newBody + parts.join(''), 'utf8')
  touched++
  moved += orphans.length
}

console.log(`статей поправлено: ${touched}`)
console.log(`источников переехало в «Дополнительное чтение»: ${moved}`)
