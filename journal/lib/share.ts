import type { Entry } from './journal'
import { TOPICS, absoluteUrl, LIMITS } from './site'
import { formatDay } from './format'

/**
 * Deterministic share text. The author wrote every word on the page; these
 * functions only reformat — no generation, ever. The plain-text body comes from
 * the build index, where markdown was already stripped.
 */

const HASHTAGS: Record<string, string[]> = {
  python: ['#Python', '#LearningInPublic', '#CodeNewbie'],
  swedish: ['#Swedish', '#LanguageLearning', '#LearningInPublic'],
  english: ['#English', '#LanguageLearning', '#LearningInPublic'],
  security: ['#CyberSecurity', '#InfoSec', '#LearningInPublic'],
  life: ['#LearningInPublic', '#CareerChange', '#100DaysOfCode'],
}

export function linkedinPost(entry: Entry): string {
  const heading = `Day ${entry.day} — ${TOPICS[entry.topic].label}`
  const tags = (HASHTAGS[entry.topic] ?? HASHTAGS.life)!.join(' ')
  return `${heading}\n\n${entry.title}.\n\n${entry.plain}\n\n${tags}`
}

export function linkedinComment(entry: Entry): string {
  return `Full entry and every day before it:\n${absoluteUrl(entry.path)}`
}

export type Tweet = { text: string; length: number; over: boolean }

/**
 * Splits the entry into a thread. Paragraph boundaries are respected; a
 * paragraph too long for one post is split on sentence boundaries. Each post
 * gets a `(n/total)` marker, and the closer carries the link.
 */
export function xThread(entry: Entry): Tweet[] {
  const limit = LIMITS.xLimit
  // Room for the " (10/12)" suffix.
  const room = limit - 8

  const hook = `Day ${formatDay(entry.day)} of learning in public.\n\n${entry.title}.`
  const closer = `Full entry:\n${absoluteUrl(entry.path)}`

  const chunks: string[] = []
  for (const paragraph of entry.plain.split(/\n\s*\n/)) {
    const clean = paragraph.trim()
    if (!clean) continue
    if (clean.length <= room) {
      chunks.push(clean)
      continue
    }
    // Sentence-by-sentence packing for oversized paragraphs.
    let current = ''
    for (const sentence of clean.split(/(?<=[.!?])\s+/)) {
      if (!current) {
        current = sentence
      } else if (`${current} ${sentence}`.length <= room) {
        current = `${current} ${sentence}`
      } else {
        chunks.push(current)
        current = sentence
      }
    }
    if (current) chunks.push(current)
  }

  // Merge middle chunks upward where two fit in one post, to keep threads short.
  const merged: string[] = []
  for (const chunk of chunks) {
    const last = merged[merged.length - 1]
    if (last && `${last}\n\n${chunk}`.length <= room) {
      merged[merged.length - 1] = `${last}\n\n${chunk}`
    } else {
      merged.push(chunk)
    }
  }

  const texts = [hook, ...merged, closer]
  const total = texts.length

  return texts.map((text, i) => {
    const numbered = total > 2 ? `${text} (${i + 1}/${total})` : text
    return { text: numbered, length: numbered.length, over: numbered.length > limit }
  })
}

export function linkedinLength(entry: Entry): {
  length: number
  warn: boolean
  over: boolean
} {
  const length = linkedinPost(entry).length
  return {
    length,
    warn: length > LIMITS.linkedinWarn,
    over: length > LIMITS.linkedinLimit,
  }
}
