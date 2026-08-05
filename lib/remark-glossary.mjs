// Remark-плагин: подсвечивает термины глоссария прямо при сборке.
//
// Почему на сборке, а не в браузере: результат уходит в статический HTML,
// работает без JS, индексируется поисковиками и не мигает при загрузке.
//
// Правила:
//   — только первое вхождение термина на страницу
//   — потолок: 12 в статьях, 6 в главах руководства
//   — не трогаем заголовки, блок «Ключевые термины», список источников,
//     ссылки, код и то, что уже размечено вручную

import fs from 'node:fs'
import path from 'node:path'
import { buildMatcher } from './glossary-match.mjs'

const raw = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'content/glossary-index.json'), 'utf8'),
)

// Термины руководства уже размечены вручную через <Term> — не дублируем
const matcher = buildMatcher(raw.terms.filter((t) => t.kind !== 'guide'))

const STOP_HEADINGS = ['ключевые термины', 'научные источники', 'источники']

function headingText(node) {
  let out = ''
  const walk = (n) => {
    if (n.type === 'text') out += n.value
    if (n.children) n.children.forEach(walk)
  }
  walk(node)
  return out.trim().toLowerCase()
}

export default function remarkGlossary() {
  return (tree, file) => {
    const isChapter = String(file.path || '').includes(`content${path.sep}chapters`)
    const limit = isChapter ? 6 : 12

    const used = new Set()
    let count = 0
    let stopped = false

    const visit = (node, parent) => {
      if (stopped) return

      if (node.type === 'heading') {
        if (STOP_HEADINGS.includes(headingText(node))) stopped = true
        return // в заголовках не подсвечиваем
      }
      // Ссылки, код и уже размеченные вручную куски пропускаем
      if (node.type === 'link' || node.type === 'inlineCode' || node.type === 'code') return
      if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') return

      if (node.type === 'text' && parent && Array.isArray(parent.children)) {
        if (count >= limit) return
        for (const { term, re } of matcher) {
          if (count >= limit) break
          if (used.has(term.key)) continue
          const m = re.exec(node.value)
          if (!m) continue

          const before = node.value.slice(0, m.index)
          const hit = m[0]
          const after = node.value.slice(m.index + hit.length)

          const replacement = {
            type: 'mdxJsxTextElement',
            name: 'G',
            attributes: [{ type: 'mdxJsxAttribute', name: 'k', value: term.key }],
            children: [{ type: 'text', value: hit }],
          }

          const idx = parent.children.indexOf(node)
          const parts = []
          if (before) parts.push({ type: 'text', value: before })
          parts.push(replacement)
          if (after) parts.push({ type: 'text', value: after })
          parent.children.splice(idx, 1, ...parts)

          used.add(term.key)
          count++
          // Остаток строки обрабатываем как новый текстовый узел
          if (after) visit(parts[parts.length - 1], parent)
          return
        }
        return
      }

      if (node.children) {
        // копия: дети меняются по ходу обхода
        for (const child of [...node.children]) visit(child, node)
      }
    }

    visit(tree, null)
  }
}
