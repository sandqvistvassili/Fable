import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LedgerList from '@/components/LedgerList'
import Pagination from '@/components/Pagination'
import { entries, paginate } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Every entry, newest first — the complete day-by-day record.',
  alternates: { canonical: absoluteUrl('/journal') },
}

export default function JournalPage() {
  const { items, page, pages } = paginate(entries, 1)

  return (
    <>
      <SiteHeader current="/journal" />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Journal</h1>
        <LedgerList entries={items} />
        <Pagination page={page} pages={pages} basePath="/journal" />
      </main>
      <SiteFooter />
    </>
  )
}
