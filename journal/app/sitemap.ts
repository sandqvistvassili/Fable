import type { MetadataRoute } from 'next'
import { entries, topics, weeks, tags, stats } from '@/lib/journal'
import { TOPIC_KEYS, absoluteUrl, LIMITS } from '@/lib/site'

export const dynamic = 'force-static'

/**
 * Only pages that are meant to rank belong here. Noindexed pages (thin hubs,
 * share views, search) are deliberately absent — a sitemap that contradicts
 * robots meta reads as a broken site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = stats.latestDate

  const fixed: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/journal'), lastModified: latest, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/topics'), lastModified: latest, changeFrequency: 'weekly', priority: 0.5 },
    { url: absoluteUrl('/stats'), lastModified: latest, changeFrequency: 'weekly', priority: 0.3 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/now'), changeFrequency: 'monthly', priority: 0.4 },
  ]

  const entryPages: MetadataRoute.Sitemap = entries.map((e) => ({
    url: absoluteUrl(e.path),
    lastModified: e.date,
    changeFrequency: 'yearly',
    priority: e.type === 'article' ? 0.8 : 0.6,
  }))

  const ledgerPages: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, Math.ceil(entries.length / LIMITS.pageSize) - 1) },
    (_, i) => ({
      url: absoluteUrl(`/journal/page/${i + 2}`),
      lastModified: latest,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    }),
  )

  const topicPages: MetadataRoute.Sitemap = TOPIC_KEYS.filter((k) => topics[k].indexable).map(
    (k) => ({
      url: absoluteUrl(`/topics/${k}`),
      lastModified: latest,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  )

  const tagPages: MetadataRoute.Sitemap = tags
    .filter((t) => t.indexable)
    .map((t) => ({
      url: absoluteUrl(`/tags/${t.tag}`),
      lastModified: latest,
      changeFrequency: 'weekly',
      priority: 0.3,
    }))

  const weekPages: MetadataRoute.Sitemap = weeks.map((w) => ({
    url: absoluteUrl(`/week/${w.week}`),
    lastModified: w.to,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...fixed, ...entryPages, ...ledgerPages, ...topicPages, ...tagPages, ...weekPages]
}
