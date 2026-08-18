import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Node-side view of `site.config.json`. The app reads the same file through
 * `lib/site.ts`, so configuration lives in exactly one place.
 */

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const config = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'))

export const TOPIC_KEYS = Object.keys(config.topics)
export const LIMITS = config.limits

export const PATHS = {
  root: ROOT,
  journal: join(ROOT, 'content', 'journal'),
  topics: join(ROOT, 'content', 'topics'),
  weeks: join(ROOT, 'content', 'weeks'),
  index: join(ROOT, 'content', 'journal-index.json'),
  public: join(ROOT, 'public'),
  og: join(ROOT, 'public', 'og'),
}
