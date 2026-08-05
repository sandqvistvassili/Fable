import type { MetadataRoute } from 'next'
import { chapters } from '@/lib/chapters'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/book`, priority: 0.9 },
    ...chapters.map((c) => ({
      url: `${SITE_URL}/book/${c.slug}`,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/glossary`, priority: 0.5 },
  ]
}
