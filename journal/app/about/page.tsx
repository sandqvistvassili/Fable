import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd from '@/components/JsonLd'
import About from '@/content/pages/about.mdx'
import { personJsonLd } from '@/lib/jsonld'
import { absoluteUrl, AUTHOR } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description: AUTHOR.bio,
  alternates: { canonical: absoluteUrl('/about') },
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader current="/about" />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">About</h1>
        <div className="prose">
          <About />
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={personJsonLd()} />
    </>
  )
}
