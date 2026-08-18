import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LedgerList from '@/components/LedgerList'
import { tags, getTag, entriesByTag } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return tags.map(({ tag }) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const meta = getTag(tag)
  if (!meta) return {}
  return {
    title: `Tagged: ${tag}`,
    description: `Journal entries tagged "${tag}".`,
    alternates: { canonical: absoluteUrl(`/tags/${tag}`) },
    // Tag pages are the classic thin-content trap; index only substantial ones.
    robots: meta.indexable ? undefined : { index: false, follow: true },
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  if (!getTag(tag)) notFound()
  const list = entriesByTag(tag)

  return (
    <>
      <SiteHeader current="/topics" />
      <main id="main" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-mach text-micro uppercase tracking-[0.14em] text-ink-soft tnum">
            Tag · {list.length} {list.length === 1 ? 'entry' : 'entries'}
          </p>
          <h1 className="m-0 font-mach text-step-2 font-semibold tracking-tight">{tag}</h1>
        </div>
        <LedgerList entries={list} />
      </main>
      <SiteFooter />
    </>
  )
}
