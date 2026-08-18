import Link from 'next/link'
import type { Entry } from '@/lib/journal'
import { TOPICS } from '@/lib/site'
import { formatDay, formatFull } from '@/lib/format'

/** The machine's line above the human's title: day, date, topic, length. */
export default function EntryMeta({ entry }: { entry: Entry }) {
  return (
    <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
      <span className="font-semibold text-accent">Day {formatDay(entry.day)}</span>
      <time dateTime={entry.date}>{formatFull(entry.date)}</time>
      <Link href={`/topics/${entry.topic}`} className="no-underline hover:text-accent">
        {TOPICS[entry.topic].label}
      </Link>
      <span>{entry.words} words</span>
      {entry.milestone ? <span className="text-accent">◆ milestone</span> : null}
    </p>
  )
}
