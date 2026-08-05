import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { chapters, getChapter, getPrevNext } from '@/lib/chapters'
import { SITE_URL } from '@/lib/site'
import ReadingProgress from '@/components/ReadingProgress'
import ChapterTOC from '@/components/ChapterTOC'
import ChapterNav from '@/components/ChapterNav'

export const dynamicParams = false

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const chapter = getChapter(slug)
  if (!chapter) return {}
  return {
    title: chapter.seoTitle,
    description: chapter.description,
    alternates: { canonical: `${SITE_URL}/book/${chapter.slug}` },
    openGraph: {
      type: 'article',
      title: chapter.seoTitle,
      description: chapter.description,
      url: `${SITE_URL}/book/${chapter.slug}`,
    },
  }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const chapter = getChapter(slug)
  if (!chapter) notFound()

  const { default: Content } = await import(`@/content/chapters/${chapter.file}.mdx`)
  const { prev, next } = getPrevNext(slug)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: chapter.title,
      alternativeHeadline: chapter.seoTitle,
      description: chapter.description,
      inLanguage: 'ru',
      position: chapter.order,
      isPartOf: {
        '@type': 'Book',
        name: 'Руководство, которого у тебя никогда не было',
        url: SITE_URL,
      },
      mainEntityOfPage: `${SITE_URL}/book/${chapter.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Книга',
          item: `${SITE_URL}/book`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: chapter.title,
          item: `${SITE_URL}/book/${chapter.slug}`,
        },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <main className="prose-book" style={{ padding: '40px 20px 80px' }}>
        <nav aria-label="Хлебные крошки" style={{ fontSize: '15px', margin: '0 0 24px' }}>
          <Link href="/book" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
            Книга
          </Link>
          <span style={{ color: 'var(--mute)' }}> / </span>
          <span style={{ color: 'var(--ink-soft)' }}>{chapter.title}</span>
        </nav>

        <ChapterTOC currentSlug={slug} />

        <article>
          <Content />
        </article>

        <ChapterNav prev={prev} next={next} />
      </main>
    </>
  )
}
