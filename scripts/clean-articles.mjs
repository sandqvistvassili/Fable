// Разовая чистка перенесённых статей:
//  1) снимает концовки-отсылки на старый проект (*The Willpower Lie* … sandqvist.me)
//  2) убирает поле date из фронтматтера — даты были проставлены пачкой
//     и ничего не означают, а статьи вневременные
//
// Запуск: node scripts/clean-articles.mjs

import fs from 'node:fs'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'content/blog')
let strippedCta = 0
let strippedDate = 0
let escapedLt = 0

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.mdx'))) {
  const p = path.join(DIR, f)
  let raw = fs.readFileSync(p, 'utf8')
  const before = raw

  // 1. Концовка со ссылкой на старый проект: горизонтальная черта + абзац
  raw = raw.replace(
    /\n+---\n+\*The Willpower Lie\*[^\n]*\n*$/,
    '\n',
  )
  if (raw !== before) strippedCta++

  // 2. Поле date из фронтматтера
  const withoutDate = raw.replace(/^(---\n(?:.*\n)*?)date:[^\n]*\n/m, '$1')
  if (withoutDate !== raw) {
    strippedDate++
    raw = withoutDate
  }

  // 3. Знак «меньше» в сравнениях (<25, < 10) MDX принимает за начало
  //    JSX-тега и падает. Экранируем — на вид ничего не меняется.
  const [head, ...rest] = raw.split(/\n---\n/)
  if (rest.length) {
    const body = rest.join('\n---\n')
    const escaped = body.replace(/<(?![a-zA-Zа-яА-Я/!])/g, '&lt;')
    if (escaped !== body) {
      escapedLt++
      raw = `${head}\n---\n${escaped}`
    }
  }

  if (raw !== before) fs.writeFileSync(p, raw, 'utf8')
}

console.log(`снято концовок старого проекта: ${strippedCta}`)
console.log(`убрано полей date: ${strippedDate}`)
console.log(`файлов с экранированным «<»: ${escapedLt}`)
