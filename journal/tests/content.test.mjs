import { describe, it, expect } from 'vitest'
import { entrySchema, slugify, entrySlug, entryPath, readEntries } from '../scripts/content.mjs'

const valid = {
  schemaVersion: 1,
  type: 'note',
  title: 'What finally made list comprehensions click',
  summary: 'I rewrote the same loop four times before I realised I was reading it backwards.',
  topic: 'python',
  tags: ['lists'],
  day: 8,
  date: '2026-08-18',
}

describe('entrySchema', () => {
  it('accepts a valid note and applies defaults', () => {
    const parsed = entrySchema.parse(valid)
    expect(parsed.milestone).toBe(false)
    expect(parsed.draft).toBe(false)
    expect(parsed.related).toEqual([])
  })

  it('normalises YAML Date objects into ISO strings', () => {
    const parsed = entrySchema.parse({ ...valid, date: new Date('2026-08-18T00:00:00Z') })
    expect(parsed.date).toBe('2026-08-18')
  })

  it('rejects a title over the limit', () => {
    const long = { ...valid, title: 'x'.repeat(61) }
    expect(entrySchema.safeParse(long).success).toBe(false)
  })

  it('rejects an unknown topic', () => {
    expect(entrySchema.safeParse({ ...valid, topic: 'crypto' }).success).toBe(false)
  })

  it('rejects an impossible calendar date', () => {
    expect(entrySchema.safeParse({ ...valid, date: '2026-02-30' }).success).toBe(false)
  })

  it('requires a slug on articles', () => {
    expect(entrySchema.safeParse({ ...valid, type: 'article' }).success).toBe(false)
    expect(
      entrySchema.safeParse({ ...valid, type: 'article', slug: 'my-first-guide' }).success,
    ).toBe(true)
  })
})

describe('slugify', () => {
  it('lowercases, hyphenates, drops apostrophes and accents', () => {
    expect(slugify("Sweden's Å is tricky!")).toBe('swedens-a-is-tricky')
  })

  it('never ends with a hyphen even after truncation', () => {
    expect(slugify('a'.repeat(59) + ' b')).not.toMatch(/-$/)
  })
})

describe('entrySlug / entryPath', () => {
  it('notes get day-N- slugs under /journal', () => {
    const fm = entrySchema.parse(valid)
    expect(entrySlug(fm)).toBe('day-8-what-finally-made-list-comprehensions-click')
    expect(entryPath(fm)).toBe('/journal/day-8-what-finally-made-list-comprehensions-click')
  })

  it('articles use their own slug under /guides', () => {
    const fm = entrySchema.parse({ ...valid, type: 'article', slug: 'first-guide' })
    expect(entryPath(fm)).toBe('/guides/first-guide')
  })
})

describe('readEntries against the real content directory', () => {
  it('finds no problems in the shipped entries', () => {
    const { problems } = readEntries({ includeDrafts: true })
    expect(problems).toEqual([])
  })

  it('numbers days sequentially from 1', () => {
    const { allEntries } = readEntries({ includeDrafts: true })
    const days = allEntries.map((e) => e.day).sort((a, b) => a - b)
    expect(days).toEqual(days.map((_, i) => i + 1))
  })
})
