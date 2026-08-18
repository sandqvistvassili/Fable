import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { entries, stats, topics, currentStreak, weeks } from '@/lib/journal'
import { TOPIC_KEYS, absoluteUrl } from '@/lib/site'
import { formatNumber, formatDay, daysBetween } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Stats',
  description: 'The journal in numbers: entries, words, streaks, and the activity record.',
  alternates: { canonical: absoluteUrl('/stats') },
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-rule-strong pl-3">
      <span className="font-mach text-step-2 font-semibold tnum leading-none">{value}</span>
      <span className="font-mach text-micro uppercase tracking-[0.1em] text-ink-soft">{label}</span>
    </div>
  )
}

/** GitHub-style activity grid, rendered as one cell per calendar day. */
function ActivityGrid() {
  const DAY = 86_400_000
  const start = Date.parse(`${stats.startDate}T00:00:00Z`)
  const end = Date.parse(`${stats.latestDate}T00:00:00Z`)

  const days: { date: string; written: boolean }[] = []
  for (let ms = start; ms <= end; ms += DAY) {
    const date = new Date(ms).toISOString().slice(0, 10)
    days.push({ date, written: Boolean(stats.perDate[date]) })
  }

  return (
    <div className="flex flex-wrap gap-1" role="img" aria-label="One square per day; filled means an entry was written">
      {days.map((d) => (
        <span
          key={d.date}
          title={`${d.date}${d.written ? ' — written' : ''}`}
          className={`h-3 w-3 rounded-[1px] ${d.written ? 'bg-accent' : 'bg-sunk border border-rule'}`}
        />
      ))}
    </div>
  )
}

export default function StatsPage() {
  const streak = currentStreak()
  const calendarDays = daysBetween(stats.startDate, stats.latestDate) + 1
  const writtenDays = Object.keys(stats.perDate).length
  const coverage = Math.round((writtenDays / calendarDays) * 100)
  const milestones = entries.filter((e) => e.milestone)

  return (
    <>
      <SiteHeader current="/stats" />
      <main id="main" className="flex flex-col gap-8">
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">Stats</h1>

        <section className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4" aria-label="Totals">
          <Figure value={formatDay(stats.latestDay)} label="days" />
          <Figure value={formatNumber(stats.words)} label="words" />
          <Figure value={String(streak)} label="day streak" />
          <Figure value={`${coverage}%`} label="days written" />
        </section>

        <section className="flex flex-col gap-3" aria-label="Activity">
          <h2 className="m-0 border-b border-rule pb-2 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
            Every day since {stats.startDate}
          </h2>
          <ActivityGrid />
        </section>

        <section className="flex flex-col gap-3" aria-label="By topic">
          <h2 className="m-0 border-b border-rule pb-2 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
            By topic
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {TOPIC_KEYS.map((key) => {
              const topic = topics[key]
              const share = stats.entries ? topic.count / stats.entries : 0
              return (
                <li key={key} className="grid grid-cols-[6rem_3rem_1fr] items-center gap-3">
                  <span className="font-mach text-small">{topic.label}</span>
                  <span className="font-mach text-small text-ink-soft tnum text-right">
                    {topic.count}
                  </span>
                  <span className="h-2.5 rounded-[1px] bg-sunk">
                    <span
                      className="block h-full rounded-[1px] bg-accent-quiet"
                      style={{ width: `${Math.max(share * 100, topic.count ? 2 : 0)}%` }}
                    />
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-3" aria-label="Milestones">
          <h2 className="m-0 border-b border-rule pb-2 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
            Milestones
          </h2>
          {milestones.length ? (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {milestones.map((m) => (
                <li key={m.slug}>
                  <a href={m.path} className="no-underline hover:text-accent">
                    <span className="font-mach text-small text-accent tnum">
                      ◆ {formatDay(m.day)}
                    </span>{' '}
                    {m.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 font-mach text-small text-ink-soft">None yet.</p>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-label="Weeks">
          <h2 className="m-0 border-b border-rule pb-2 font-mach text-micro font-normal uppercase tracking-[0.14em] text-ink-soft">
            Weeks
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {weeks.map((w) => (
              <li key={w.week}>
                <a
                  href={`/week/${w.week}`}
                  className="inline-block rounded-[2px] border border-rule px-2.5 py-1 font-mach text-small text-ink-mid no-underline tnum hover:border-accent hover:text-accent"
                >
                  {w.week} <span className="text-ink-soft">· {w.count}d</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
