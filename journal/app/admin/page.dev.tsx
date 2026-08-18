import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import AdminClient from '@/components/AdminClient'

/**
 * The local writing desk. The `.dev.tsx` extension means this page is only
 * registered while `next dev` is running — production builds do not know the
 * route exists, so there is nothing to protect, authenticate, or attack.
 */

export const metadata: Metadata = {
  title: 'Writing desk',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Writing desk</h1>
        <AdminClient />
      </main>
    </>
  )
}
