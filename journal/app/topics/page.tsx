import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { topics } from '@/lib/journal'
import { TOPIC_KEYS, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'The five subjects this journal is about, and every entry in each.',
  alternates: { canonical: absoluteUrl('/topics') },
}

export default function TopicsPage() {
  return (
    <>
      <SiteHeader current="/topics" />
      <main id="main" className="flex flex-col gap-6">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Topics</h1>
        <ul className="m-0 flex list-none flex-col p-0">
          {TOPIC_KEYS.map((key) => {
            const topic = topics[key]
            return (
              <li key={key}>
                <Link
                  href={`/topics/${key}`}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-rule py-3 pr-2 no-underline hover:bg-accent-wash sm:grid-cols-[8rem_1fr_auto]"
                >
                  <span className="font-semibold group-hover:text-accent">{topic.label}</span>
                  <span className="col-span-2 text-small text-ink-mid sm:col-span-1">
                    {topic.blurb}
                  </span>
                  <span className="hidden font-mach text-small text-ink-soft tnum sm:inline">
                    {topic.count} {topic.count === 1 ? 'entry' : 'entries'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
