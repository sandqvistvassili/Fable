import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import EntryMeta from '@/components/EntryMeta'
import TagList from '@/components/TagList'
import JsonLd from '@/components/JsonLd'
import { notes, getEntry, neighbours, relatedEntries } from '@/lib/journal'
import { entryJsonLd } from '@/lib/jsonld'
import { absoluteUrl } from '@/lib/site'
import { formatDay } from '@/lib/format'

export const dynamicParams = false

export function generateStaticParams() {
  return notes.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) return {}
  const url = absoluteUrl(entry.path)
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: entry.title,
      description: entry.summary,
      url,
      publishedTime: entry.date,
      authors: [absoluteUrl('/about')],
      tags: [entry.topic, ...entry.tags],
      images: [{ url: absoluteUrl(`/og/${entry.slug}.png`), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.summary,
      images: [absoluteUrl(`/og/${entry.slug}.png`)],
    },
  }
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry || entry.type !== 'note') notFound()

  const { default: Content } = await import(
    `@/content/journal/${entry.file.replace(/\.mdx$/, '')}.mdx`
  )
  const { previous, next } = neighbours(entry)
  const related = relatedEntries(entry)

  return (
    <>
      <SiteHeader current="/journal" />
      <main id="main" className="flex flex-col gap-8">
        <article className="flex flex-col gap-4">
          <EntryMeta entry={entry} />
          <h1 className="m-0 max-w-[24em] text-step-3 font-semibold leading-tight tracking-tight [text-wrap:balance]">
            {entry.title}
          </h1>
          <p className="m-0 max-w-[38em] font-read text-step-1 italic text-ink-mid">
            {entry.summary}
          </p>
          <div className="prose">
            <Content />
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-4 pt-1">
            <TagList tags={entry.tags} />
            <Link
              href={`${entry.path}/share`}
              className="font-mach text-small text-ink-mid no-underline hover:text-accent no-print"
            >
              Share this entry →
            </Link>
          </div>
        </article>

        {related.length ? (
          <section aria-label="Related entries" className="flex flex-col gap-2 border-t border-rule pt-4">
            <h2 className="m-0 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
              Mentioned earlier
            </h2>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {related.map((r) => (
                <li key={r.slug} className="font-read">
                  <Link href={r.path} className="no-underline hover:text-accent">
                    <span className="font-mach text-small text-ink-soft tnum">
                      {formatDay(r.day)}
                    </span>{' '}
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav
          aria-label="Adjacent days"
          className="flex justify-between gap-4 border-t border-rule pt-4 font-mach text-small"
        >
          {previous ? (
            <Link href={previous.path} className="flex max-w-[45%] flex-col gap-0.5 no-underline group">
              <span className="text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
                ← Day {formatDay(previous.day)}
              </span>
              <span className="text-ink-mid group-hover:text-accent">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.path}
              className="flex max-w-[45%] flex-col gap-0.5 text-right no-underline group"
            >
              <span className="text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
                Day {formatDay(next.day)} →
              </span>
              <span className="text-ink-mid group-hover:text-accent">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <SiteFooter />
      <JsonLd data={entryJsonLd(entry)} />
    </>
  )
}
