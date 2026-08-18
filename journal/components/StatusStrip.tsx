import { stats, currentStreak } from '@/lib/journal'
import { TOPICS } from '@/lib/site'
import { formatDay, formatNumber, formatMonthShort } from '@/lib/format'

/**
 * The one deliberately loud element on the site. It earns the accent because it
 * is the only thing that changes every single day.
 */
export default function StatusStrip() {
  const streak = currentStreak()
  const topic = TOPICS[stats.currentTopic]

  return (
    <section
      aria-label="Journal status"
      className="border-t-2 border-accent bg-sunk px-4 py-3 font-mach text-small text-ink-mid tnum flex flex-wrap gap-x-6 gap-y-1"
    >
      <span className="font-semibold text-accent">DAY {formatDay(stats.latestDay)}</span>
      <span>
        LEARNING <strong className="font-semibold text-ink">{topic.label.toUpperCase()}</strong>
      </span>
      <span>
        <strong className="font-semibold text-ink">{formatNumber(stats.entries)}</strong> ENTRIES
      </span>
      <span>
        <strong className="font-semibold text-ink">{formatNumber(stats.words)}</strong> WORDS
      </span>
      {streak > 1 ? (
        <span>
          <strong className="font-semibold text-ink">{streak}</strong> DAY STREAK
        </span>
      ) : null}
      <span className="hidden sm:inline">SINCE {formatMonthShort(stats.startDate).toUpperCase()}</span>
    </section>
  )
}
