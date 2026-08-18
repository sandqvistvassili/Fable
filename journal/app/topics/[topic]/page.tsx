import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LedgerList from '@/components/LedgerList'
import { topics, entriesByTopic } from '@/lib/journal'
import { TOPIC_KEYS, isTopicKey, absoluteUrl } from '@/lib/site'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const dynamicParams = false

export function generateStaticParams() {
  return TOPIC_KEYS.map((topic) => ({ topic }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>
}): Promise<Metadata> {
  const { topic } = await params
  if (!isTopicKey(topic)) return {}
  const meta = topics[topic]
  return {
    title: meta.intro?.title ?? meta.label,
    description: meta.intro?.summary ?? meta.blurb,
    alternates: { canonical: absoluteUrl(`/topics/${topic}`) },
    // Hubs holding almost nothing stay out of the index until they have substance.
    robots: meta.indexable ? undefined : { index: false, follow: true },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  if (!isTopicKey(topic)) notFound()

  const meta = topics[topic]
  const list = entriesByTopic(topic)

  // The hand-written hub intro is optional MDX at content/topics/<topic>.mdx.
  let Intro: React.ComponentType | null = null
  if (existsSync(join(process.cwd(), 'content', 'topics', `${topic}.mdx`))) {
    ;({ default: Intro } = await import(`@/content/topics/${topic}.mdx`))
  }

  return (
    <>
      <SiteHeader current="/topics" />
      <main id="main" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-mach text-micro uppercase tracking-[0.14em] text-ink-soft tnum">
            Topic · {list.length} {list.length === 1 ? 'entry' : 'entries'}
          </p>
          <h1 className="m-0 text-step-3 font-semibold tracking-tight">
            {meta.intro?.title ?? meta.label}
          </h1>
        </div>

        {Intro ? (
          <div className="prose">
            <Intro />
          </div>
        ) : (
          <p className="m-0 max-w-[38em] text-step-1 italic text-ink-mid">{meta.blurb}</p>
        )}

        <LedgerList entries={list} />
      </main>
      <SiteFooter />
    </>
  )
}
