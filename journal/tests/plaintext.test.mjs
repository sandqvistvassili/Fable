import { describe, it, expect } from 'vitest'
import { toPlainText, countWords, firstParagraph } from '../scripts/plaintext.mjs'

describe('toPlainText', () => {
  it('strips emphasis but keeps the words', () => {
    expect(toPlainText('This **matters** and _this_ too.')).toBe('This matters and this too.')
  })

  it('keeps code from fenced blocks, drops the fences', () => {
    const input = 'Before\n\n```python\nprint("hi")\n```\n\nAfter'
    expect(toPlainText(input)).toBe('Before\n\nprint("hi")\n\nAfter')
  })

  it('turns list items into em-dashes', () => {
    expect(toPlainText('- one\n- two')).toBe('— one\n— two')
  })

  it('keeps the label and appends only external link targets', () => {
    expect(toPlainText('see [the docs](https://example.com/x)')).toBe(
      'see the docs (https://example.com/x)',
    )
    expect(toPlainText('see [day one](/journal/day-1-start)')).toBe('see day one')
  })

  it('drops headings markers and images, keeps heading text', () => {
    expect(toPlainText('## Heading\n\n![alt](img.png)\n\ntext')).toBe('Heading\n\ntext')
  })

  it('removes JSX tags', () => {
    expect(toPlainText('Hello <Term id="x">world</Term>')).toBe('Hello world')
  })

  it('collapses runs of blank lines', () => {
    expect(toPlainText('a\n\n\n\nb')).toBe('a\n\nb')
  })
})

describe('countWords', () => {
  it('counts words, not punctuation', () => {
    expect(countWords('One two, three — four!')).toBe(4)
  })

  it("keeps contractions as single words", () => {
    expect(countWords("don't stop")).toBe(2)
  })
})

describe('firstParagraph', () => {
  it('returns the first paragraph joined to one line', () => {
    expect(firstParagraph('line one\nline two\n\npara two')).toBe('line one line two')
  })
})
