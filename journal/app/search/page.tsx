import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import SearchClient from '@/components/SearchClient'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search every journal entry.',
  alternates: { canonical: absoluteUrl('/search') },
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Search</h1>
        <SearchClient />
      </main>
      <SiteFooter />
    </>
  )
}
