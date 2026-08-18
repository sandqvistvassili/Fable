import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import StatusStrip from '@/components/StatusStrip'
import LedgerList from '@/components/LedgerList'
import EntryMeta from '@/components/EntryMeta'
import TagList from '@/components/TagList'
import JsonLd from '@/components/JsonLd'
import { entries, notes } from '@/lib/journal'
import { websiteJsonLd, personJsonLd } from '@/lib/jsonld'

const RECENT = 14

export default async function HomePage() {
  // The home page always opens on the latest daily note; a newer long-form
  // article still appears in the ledger below, it just doesn't take over.
  const today = notes[0]
  const rest = entries.filter((e) => e.slug !== today?.slug).slice(0, RECENT)

  let Content: React.ComponentType | null = null
  if (today) {
    ;({ default: Content } = await import(`@/content/journal/${today.file.replace(/\.mdx$/, '')}.mdx`))
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-10 sm:gap-12">
        <StatusStrip />

        {today && Content ? (
          <article className="flex flex-col gap-4">
            <EntryMeta entry={today} />
            <h1 className="m-0 text-step-3 font-semibold leading-tight tracking-tight [text-wrap:balance]">
              <Link href={today.path} className="no-underline hover:text-accent">
                {today.title}
              </Link>
            </h1>
            <p className="m-0 max-w-[38em] font-read text-step-1 italic text-ink-mid">
              {today.summary}
            </p>
            <div className="prose">
              <Content />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-4 pt-1">
              <TagList tags={today.tags} />
              <Link
                href={`${today.path}/share`}
                className="font-mach text-small text-ink-mid no-underline hover:text-accent no-print"
              >
                Share this entry →
              </Link>
            </div>
          </article>
        ) : (
          <p className="font-mach text-small text-ink-soft">The first entry is on its way.</p>
        )}

        <section aria-label="Earlier entries" className="flex flex-col gap-2">
          <h2 className="m-0 border-b border-rule pb-2 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
            Earlier
          </h2>
          <LedgerList entries={rest} />
          <p className="m-0 pt-2 font-mach text-small">
            <Link href="/journal" className="no-underline text-ink-mid hover:text-accent">
              Full journal →
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={personJsonLd()} />
    </>
  )
}
