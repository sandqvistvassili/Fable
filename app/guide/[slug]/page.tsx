import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { chapters, getChapter, getPrevNext } from '@/lib/chapters'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import ReadingProgress from '@/components/ReadingProgress'
import ChapterSidebar from '@/components/ChapterSidebar'
import ChapterTOC from '@/components/ChapterTOC'
import ChapterNav from '@/components/ChapterNav'
import ChapterArticles from '@/components/ChapterArticles'
import SiteHeader from '@/components/SiteHeader'

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
    alternates: { canonical: `${SITE_URL}/guide/${chapter.slug}` },
    openGraph: {
      type: 'article',
      title: chapter.seoTitle,
      description: chapter.description,
      url: `${SITE_URL}/guide/${chapter.slug}`,
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
      timeRequired: `PT${chapter.minutes}M`,
      isPartOf: {
        '@type': 'CreativeWorkSeries',
        name: SITE_NAME,
        url: SITE_URL,
      },
      mainEntityOfPage: `${SITE_URL}/guide/${chapter.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Руководство',
          item: `${SITE_URL}/guide`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: chapter.title,
          item: `${SITE_URL}/guide/${chapter.slug}`,
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
      <SiteHeader reading />

      <div className="reader">
        <ChapterSidebar currentSlug={slug} />

        <main style={{ padding: '48px 0 96px', minWidth: 0 }}>
          <div className="prose-book">
            <ChapterTOC currentSlug={slug} />

            <header className="chapter-head">
              <p className="chapter-eyebrow">
                <Link href="/guide">Руководство</Link>
                <span aria-hidden>·</span>
                <span>
                  Глава <span className="num">{chapter.order}</span>
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span className="num">{chapter.minutes}</span> мин
                </span>
              </p>
            </header>

            <article>
              <Content />
            </article>

            <ChapterArticles chapterSlug={slug} />

            <ChapterNav prev={prev} next={next} />
          </div>
        </main>
      </div>
    </>
  )
}
