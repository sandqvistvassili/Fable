import type { Entry } from './journal'
import { AUTHOR, SITE, SITE_URL, absoluteUrl } from './site'

/**
 * JSON-LD structured data. Kept as plain objects; pages serialise them into a
 * single script tag. The XSS-relevant `</script>` sequence cannot occur in our
 * data (it is all validated frontmatter), but serialisation still escapes `<`
 * to be safe by construction.
 */

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR.name,
    url: SITE_URL,
    description: AUTHOR.bio,
    knowsLanguage: AUTHOR.languages,
    sameAs: Object.values(AUTHOR.social),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE_URL,
    description: SITE.description,
    author: { '@type': 'Person', name: AUTHOR.name, url: SITE_URL },
    inLanguage: 'en',
  }
}

export function entryJsonLd(entry: Entry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.date,
    dateModified: entry.date,
    url: absoluteUrl(entry.path),
    mainEntityOfPage: absoluteUrl(entry.path),
    wordCount: entry.words,
    keywords: [entry.topic, ...entry.tags].join(', '),
    isPartOf: {
      '@type': 'Blog',
      name: SITE.title,
      url: absoluteUrl('/journal'),
    },
    author: { '@type': 'Person', name: AUTHOR.name, url: SITE_URL },
    publisher: { '@type': 'Person', name: AUTHOR.name, url: SITE_URL },
    image: absoluteUrl(`/og/${entry.slug}.png`),
    inLanguage: 'en',
  }
}
