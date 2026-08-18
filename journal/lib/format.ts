/**
 * Date and number formatting.
 *
 * Hand-rolled rather than `toLocaleDateString`, so the strings are identical no
 * matter which machine runs the build.
 */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function parts(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`)
  return {
    year: date.getUTCFullYear(),
    monthIndex: date.getUTCMonth(),
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
  }
}

/** `Tue, 18 Aug 2026` — the entry page meta line. */
export function formatFull(iso: string): string {
  const { year, monthIndex, day, weekday } = parts(iso)
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS_SHORT[monthIndex]} ${year}`
}

/** `18 Aug` — ledger rows, where the year lives in the month separator. */
export function formatShort(iso: string): string {
  const { monthIndex, day } = parts(iso)
  return `${day} ${MONTHS_SHORT[monthIndex]}`
}

/** `August 2026` — ledger month separators. */
export function formatMonth(iso: string): string {
  const { year, monthIndex } = parts(iso)
  return `${MONTHS_LONG[monthIndex]} ${year}`
}

/** `Aug 2026` — compact, for the status strip. */
export function formatMonthShort(iso: string): string {
  const { year, monthIndex } = parts(iso)
  return `${MONTHS_SHORT[monthIndex]} ${year}`
}

/** Key used to group ledger rows into months. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

/** Day number as it appears everywhere: zero-padded to at least three digits. */
export function formatDay(day: number): string {
  return String(day).padStart(3, '0')
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`)
  const to = Date.parse(`${toIso}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}
