import type { MetadataRoute } from 'next'
import { chapters } from '@/lib/chapters'
import { articles, categories } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/guide`, priority: 0.9 },
    ...chapters.map((c) => ({
      url: `${SITE_URL}/guide/${c.slug}`,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/glossary`, priority: 0.5 },
    { url: `${SITE_URL}/blog`, priority: 0.8 },
    ...categories.map((c) => ({ url: `${SITE_URL}/blog/topic/${c.id}`, priority: 0.6 })),
    // Дубликаты по теме в карту не попадают: для них canonical ведёт
    // на основную статью группы, её и индексируем.
    ...articles
      .filter((a) => !a.canonicalSlug || a.canonicalSlug === a.slug)
      .map((a) => ({ url: `${SITE_URL}/blog/${a.slug}`, priority: 0.5 })),
  ]
}
