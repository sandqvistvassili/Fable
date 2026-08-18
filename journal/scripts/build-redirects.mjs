import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { PATHS } from './config.mjs'

/**
 * Emits platform redirect files from `redirects.ts`.
 * Run after editing that file: `node scripts/build-redirects.mjs`
 */

const source = await import(join(PATHS.root, 'redirects.ts')).catch(() => null)

// redirects.ts is TypeScript; parse it the boring way if direct import fails.
let redirects = source?.redirects
if (!redirects) {
  const { readFileSync } = await import('node:fs')
  const text = readFileSync(join(PATHS.root, 'redirects.ts'), 'utf8')
  redirects = [...text.matchAll(/\{\s*from:\s*'([^']+)',\s*to:\s*'([^']+)'\s*\}/g)].map((m) => ({
    from: m[1],
    to: m[2],
  }))
}

// Cloudflare Pages / Netlify format.
mkdirSync(PATHS.public, { recursive: true })
const lines = redirects.map((r) => `${r.from} ${r.to} 301`).join('\n')
writeFileSync(join(PATHS.public, '_redirects'), lines ? `${lines}\n` : '')

// Vercel format.
writeFileSync(
  join(PATHS.root, 'vercel.json'),
  `${JSON.stringify(
    {
      redirects: redirects.map((r) => ({ source: r.from, destination: r.to, permanent: true })),
    },
    null,
    2,
  )}\n`,
)

console.log(`✓ redirects · ${redirects.length} rule(s) → public/_redirects, vercel.json`)
