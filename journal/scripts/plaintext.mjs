/**
 * MDX → plain text.
 *
 * LinkedIn and X render no markup at all: asterisks, hashes and bracket-link
 * syntax paste through literally and look broken. This turns an entry body into
 * something safe to paste, while keeping the paragraph breaks both platforms do
 * respect.
 */

const EXTERNAL_LINK = /^https?:\/\//i

export function toPlainText(mdx) {
  let text = mdx

  // MDX import/export statements and JSX expression containers.
  text = text.replace(/^\s*(import|export)\s.+$/gm, '')
  text = text.replace(/^\s*\{\/\*[\s\S]*?\*\/\}\s*$/gm, '')

  // Fenced code: keep the code, drop the fences and the language hint.
  // `[ \t]*$` (not `\s*$`) so the blank line after the block survives.
  text = text.replace(/^```[^\n]*\n([\s\S]*?)^```[ \t]*$/gm, (_m, code) => code.replace(/\n+$/, ''))

  // Images before links, so image alt text does not survive as a link label.
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

  // Links: keep the label, append the target only when it leaves the site.
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_m, label, href) =>
    EXTERNAL_LINK.test(href) ? `${label} (${href})` : label,
  )

  // Headings, blockquotes, horizontal rules.
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/^\s{0,3}>\s?/gm, '')
  text = text.replace(/^\s{0,3}([-*_])\s*(?:\1\s*){2,}$/gm, '')

  // Lists: em-dash reads as an intentional bullet on both platforms.
  text = text.replace(/^\s*[-*+]\s+/gm, '— ')
  text = text.replace(/^\s*(\d+)[.)]\s+/gm, '$1. ')

  // Emphasis and inline code.
  text = text.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
  text = text.replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, '$2')
  text = text.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '$1')
  text = text.replace(/`([^`]+)`/g, '$1')

  // Any remaining JSX/HTML tags.
  text = text.replace(/<\/?[A-Za-z][^>]*>/g, '')

  // Tidy whitespace: trailing spaces, runs of blank lines, leading/trailing gap.
  text = text.replace(/[ \t]+$/gm, '')
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

/** First paragraph of the body, used as a fallback excerpt. */
export function firstParagraph(plain) {
  const [first = ''] = plain.split(/\n\s*\n/)
  return first.replace(/\n/g, ' ').trim()
}

export function countWords(plain) {
  const matches = plain.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9'’-]+/g)
  return matches ? matches.length : 0
}

/** Reading time at a deliberate 200 wpm — these are short, dense entries. */
export function readingMinutes(words) {
  return Math.max(1, Math.round(words / 200))
}
