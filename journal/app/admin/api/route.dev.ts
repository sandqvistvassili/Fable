import { NextResponse } from 'next/server'
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, basename } from 'node:path'

/**
 * Dev-only admin API. The `.dev.ts` extension keeps this route out of every
 * production build (see next.config.mjs), so it never exists on the deployed
 * site — it answers only on localhost while `next dev` is running.
 */

const JOURNAL_DIR = join(process.cwd(), 'content', 'journal')

const guard = () =>
  process.env.NODE_ENV === 'production'
    ? NextResponse.json({ error: 'not available' }, { status: 404 })
    : null

export async function GET() {
  const blocked = guard()
  if (blocked) return blocked

  const files = existsSync(JOURNAL_DIR)
    ? readdirSync(JOURNAL_DIR)
        .filter((f) => f.endsWith('.mdx'))
        .sort()
        .reverse()
    : []

  return NextResponse.json({
    files: files.map((file) => ({
      file,
      content: readFileSync(join(JOURNAL_DIR, file), 'utf8'),
    })),
  })
}

export async function POST(request: Request) {
  const blocked = guard()
  if (blocked) return blocked

  const { file, content } = (await request.json()) as { file?: string; content?: string }

  if (!file || typeof content !== 'string') {
    return NextResponse.json({ error: 'file and content are required' }, { status: 400 })
  }

  // The file name is used as a path segment; strip anything path-like.
  const safe = basename(file)
  if (!/^[a-z0-9][a-z0-9-]*\.mdx$/.test(safe)) {
    return NextResponse.json(
      { error: 'file must be a lowercase-slug .mdx name, e.g. 0009-what-i-learned.mdx' },
      { status: 400 },
    )
  }

  mkdirSync(JOURNAL_DIR, { recursive: true })
  writeFileSync(join(JOURNAL_DIR, safe), content)

  return NextResponse.json({ ok: true, file: safe })
}
