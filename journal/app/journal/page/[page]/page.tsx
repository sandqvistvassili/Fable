import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LedgerList from '@/components/LedgerList'
import Pagination from '@/components/Pagination'
import { entries, paginate } from '@/lib/journal'
import { absoluteUrl, LIMITS } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  // Static export refuses an empty param list, so page 1 always exists here
  // too. Nothing links to it (the pagination component points page 1 at
  // /journal) and its canonical declares /journal the real address.
  const pages = Math.max(1, Math.ceil(entries.length / LIMITS.pageSize))
  return Array.from({ length: pages }, (_, i) => ({ page: String(i + 1) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const isFirst = page === '1'
  return {
    title: `Journal — page ${page}`,
    description: 'Every entry, newest first — the complete day-by-day record.',
    // Deeper pages are self-canonical; pointing them all at page 1 would hide
    // content. Page 1 itself is a duplicate of /journal and says so.
    alternates: { canonical: absoluteUrl(isFirst ? '/journal' : `/journal/page/${page}`) },
    robots: isFirst ? { index: false, follow: true } : undefined,
  }
}

export default async function JournalPageN({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageParam } = await params
  const pageNum = Number(pageParam)
  const { items, page, pages } = paginate(entries, pageNum)
  if (pageNum !== page) notFound()

  return (
    <>
      <SiteHeader current="/journal" />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">
          Journal <span className="font-mach text-small text-ink-soft tnum">page {page}</span>
        </h1>
        <LedgerList entries={items} />
        <Pagination page={page} pages={pages} basePath="/journal" />
      </main>
      <SiteFooter />
    </>
  )
}
