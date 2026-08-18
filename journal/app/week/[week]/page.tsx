import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LedgerList from '@/components/LedgerList'
import { weeks, getWeek, entriesByWeek } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'
import { formatShort, formatNumber } from '@/lib/format'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const dynamicParams = false

export function generateStaticParams() {
  return weeks.map((w) => ({ week: String(w.week) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ week: string }>
}): Promise<Metadata> {
  const { week } = await params
  const meta = getWeek(Number(week))
  if (!meta) return {}
  return {
    title: meta.intro?.title ?? `Week ${week}`,
    description:
      meta.intro?.summary ??
      `Week ${week} of learning in public: ${meta.count} entries, ${formatNumber(meta.words)} words.`,
    alternates: { canonical: absoluteUrl(`/week/${week}`) },
  }
}

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week: weekParam } = await params
  const weekNum = Number(weekParam)
  const meta = getWeek(weekNum)
  if (!meta) notFound()

  const list = entriesByWeek(weekNum)

  // Optional hand-written wrap-up at content/weeks/<n>.mdx.
  let Intro: React.ComponentType | null = null
  if (existsSync(join(process.cwd(), 'content', 'weeks', `${weekNum}.mdx`))) {
    ;({ default: Intro } = await import(`@/content/weeks/${weekNum}.mdx`))
  }

  const older = weeks.find((w) => w.week === weekNum - 1)
  const newer = weeks.find((w) => w.week === weekNum + 1)

  return (
    <>
      <SiteHeader current="/journal" />
      <main id="main" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-mach text-micro uppercase tracking-[0.14em] text-ink-soft tnum">
            Week {weekNum} · {formatShort(meta.from)} – {formatShort(meta.to)} · {meta.count}{' '}
            entries · {formatNumber(meta.words)} words
          </p>
          <h1 className="m-0 text-step-3 font-semibold tracking-tight [text-wrap:balance]">
            {meta.intro?.title ?? `Week ${weekNum}`}
          </h1>
        </div>

        {Intro ? (
          <div className="prose">
            <Intro />
          </div>
        ) : null}

        <LedgerList entries={[...list].reverse()} withMonths={false} />

        <nav
          aria-label="Adjacent weeks"
          className="flex justify-between border-t border-rule pt-4 font-mach text-small"
        >
          {older ? (
            <a href={`/week/${older.week}`} className="no-underline text-ink-mid hover:text-accent">
              ← Week {older.week}
            </a>
          ) : (
            <span />
          )}
          {newer ? (
            <a href={`/week/${newer.week}`} className="no-underline text-ink-mid hover:text-accent">
              Week {newer.week} →
            </a>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <SiteFooter />
    </>
  )
}
