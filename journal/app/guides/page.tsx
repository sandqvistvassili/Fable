import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { articles } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'
import { formatFull } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Occasional long-form pieces distilled from the daily entries.',
  alternates: { canonical: absoluteUrl('/guides') },
  // Nothing to index until the first long-form piece exists.
  robots: articles.length ? undefined : { index: false, follow: true },
}

export default function GuidesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Guides</h1>
        {articles.length ? (
          <ul className="m-0 flex list-none flex-col gap-5 p-0">
            {articles.map((a) => (
              <li key={a.slug} className="flex flex-col gap-1">
                <Link
                  href={a.path}
                  className="text-step-1 font-semibold no-underline hover:text-accent [text-wrap:balance]"
                >
                  {a.title}
                </Link>
                <p className="m-0 max-w-[38em] text-small text-ink-mid">{a.summary}</p>
                <p className="m-0 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
                  {formatFull(a.date)} · {a.words} words · {a.readingMinutes} min
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 max-w-[38em] text-ink-mid">
            Nothing long-form yet. The daily entries come first; the first guide will be distilled
            from them once there is enough worth distilling.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
