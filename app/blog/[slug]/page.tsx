import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  articles,
  getArticle,
  getCategory,
  chapterForArticle,
  relatedArticles,
} from '@/lib/blog'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import ReadingProgress from '@/components/ReadingProgress'
import GuideCallout from '@/components/GuideCallout'
import HealthDisclaimer from '@/components/HealthDisclaimer'

export const dynamicParams = false

// Категории, где статьи касаются здоровья и требуют оговорки
const MEDICAL = new Set(['pitanie', 'pohudenie', 'zdorovye', 'dobavki'])

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) return {}
  // У статей на одну тему canonical ведёт на основную: страницы остаются
  // обе, но в поиске они не конкурируют между собой.
  const canonical = `${SITE_URL}/blog/${a.canonicalSlug ?? a.slug}`
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.description,
      url: `${SITE_URL}/blog/${a.slug}`,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) notFound()

  const { default: Content } = await import(`@/content/blog/${a.slug}.mdx`)
  const category = getCategory(a.category)
  const chapter = chapterForArticle(a)
  const related = relatedArticles(a)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      inLanguage: 'ru',
      articleSection: category?.name,
      mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
      isPartOf: { '@type': 'Blog', name: `Статьи — ${SITE_NAME}`, url: `${SITE_URL}/blog` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Статьи', item: `${SITE_URL}/blog` },
        ...(category
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: `${SITE_URL}/blog/topic/${category.id}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: category ? 3 : 2,
          name: a.title,
          item: `${SITE_URL}/blog/${a.slug}`,
        },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />
      <main className="prose-book" style={{ padding: '40px 20px 80px' }}>
        <nav aria-label="Хлебные крошки" style={{ fontSize: '15px', margin: '0 0 24px' }}>
          <Link href="/blog" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
            Статьи
          </Link>
          {category && (
            <>
              <span style={{ color: 'var(--mute)' }}> / </span>
              <Link
                href={`/blog/topic/${category.id}`}
                style={{ color: 'var(--mute)', textDecoration: 'none' }}
              >
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <h1 style={{ fontSize: '1.75em', lineHeight: 1.25, fontWeight: 600, margin: '0 0 24px' }}>
          {a.title}
        </h1>

        <article>
          <Content />
        </article>

        {MEDICAL.has(a.category) && <HealthDisclaimer />}
        {chapter && <GuideCallout chapter={chapter} />}

        {related.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 600, margin: '0 0 12px' }}>Рядом по теме</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {related.map((r) => (
                <li key={r.slug} style={{ marginBottom: '8px' }}>
                  <Link
                    href={`/blog/${r.slug}`}
                    style={{
                      display: 'block',
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                      fontSize: '16px',
                      lineHeight: 1.45,
                    }}
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}
