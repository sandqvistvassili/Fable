import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import TagList from '@/components/TagList'
import JsonLd from '@/components/JsonLd'
import { articles } from '@/lib/journal'
import { entryJsonLd } from '@/lib/jsonld'
import { absoluteUrl, TOPICS } from '@/lib/site'
import { formatFull } from '@/lib/format'

export const dynamicParams = false

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}
  const url = absoluteUrl(article.path)
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      url,
      publishedTime: article.date,
      images: [{ url: absoluteUrl(`/og/${article.slug}.png`), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  const { default: Content } = await import(
    `@/content/journal/${article.file.replace(/\.mdx$/, '')}.mdx`
  )

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-6">
        <article className="flex flex-col gap-4">
          <p className="m-0 flex flex-wrap gap-x-4 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
            <span>Guide</span>
            <time dateTime={article.date}>{formatFull(article.date)}</time>
            <Link href={`/topics/${article.topic}`} className="no-underline hover:text-accent">
              {TOPICS[article.topic].label}
            </Link>
            <span>{article.readingMinutes} min read</span>
          </p>
          <h1 className="m-0 max-w-[24em] text-step-4 font-semibold leading-tight tracking-tight [text-wrap:balance]">
            {article.title}
          </h1>
          <p className="m-0 max-w-[38em] text-step-1 italic text-ink-mid">{article.summary}</p>
          <div className="prose">
            <Content />
          </div>
          <TagList tags={article.tags} />
        </article>
      </main>
      <SiteFooter />
      <JsonLd data={entryJsonLd(article)} />
    </>
  )
}
