import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Now from '@/content/pages/now.mdx'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Now',
  description: 'What I am learning and building right now.',
  alternates: { canonical: absoluteUrl('/now') },
}

export default function NowPage() {
  return (
    <>
      <SiteHeader current="/now" />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Now</h1>
        <div className="prose">
          <Now />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
