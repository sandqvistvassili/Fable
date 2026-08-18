import Link from 'next/link'
import type { Entry } from '@/lib/journal'
import { TOPICS } from '@/lib/site'
import { formatDay, formatShort, formatMonth, monthKey } from '@/lib/format'

/**
 * The dense chronological list that gives the site its logbook feel.
 * At seven hundred entries this must scan, not decorate: one row per day,
 * tabular digits, a hairline between rows, a diamond on milestones.
 */
export default function LedgerList({
  entries,
  withMonths = true,
}: {
  entries: Entry[]
  withMonths?: boolean
}) {
  if (!entries.length) {
    return <p className="font-mach text-small text-ink-soft">Nothing here yet.</p>
  }

  let lastMonth = ''

  return (
    <ol className="m-0 list-none p-0">
      {entries.map((entry) => {
        const month = monthKey(entry.date)
        const showMonth = withMonths && month !== lastMonth
        lastMonth = month

        return (
          <li key={entry.slug}>
            {showMonth ? (
              <div className="border-b border-rule-strong pb-2 pt-6 font-mach text-micro uppercase tracking-[0.14em] text-ink-soft first:pt-0">
                {formatMonth(entry.date)}
              </div>
            ) : null}
            <Link
              href={entry.path}
              className="group grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 border-b border-rule py-2.5 pr-2 no-underline hover:bg-accent-wash sm:grid-cols-[3.2rem_4.5rem_1fr_auto]"
            >
              <span
                className={`font-mach text-small tnum ${entry.milestone ? 'font-semibold text-accent' : 'text-ink-soft'}`}
              >
                {formatDay(entry.day)}
              </span>
              <span className="hidden font-mach text-small tnum text-ink-soft sm:inline">
                {formatShort(entry.date)}
              </span>
              <span
                className={`leading-snug group-hover:text-accent ${entry.milestone ? 'font-semibold' : ''}`}
              >
                {entry.title}
                {entry.milestone ? (
                  <span aria-label=" milestone" className="text-accent text-[0.7em] align-[0.15em]">
                    {' ◆'}
                  </span>
                ) : null}
              </span>
              <span className="col-start-2 font-mach text-micro uppercase tracking-[0.08em] text-ink-soft sm:col-start-auto">
                {TOPICS[entry.topic].label}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
