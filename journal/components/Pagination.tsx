import Link from 'next/link'

export default function Pagination({
  page,
  pages,
  basePath,
}: {
  page: number
  pages: number
  basePath: string
}) {
  if (pages <= 1) return null

  const href = (p: number) => (p === 1 ? basePath : `${basePath}/page/${p}`)

  return (
    <nav
      aria-label="Pages"
      className="flex items-baseline justify-between border-t border-rule pt-4 font-mach text-small"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="no-underline text-ink-mid hover:text-accent">
          ← Newer
        </Link>
      ) : (
        <span aria-hidden className="text-ink-soft opacity-40">
          ← Newer
        </span>
      )}

      <span className="text-ink-soft tnum">
        {page} / {pages}
      </span>

      {page < pages ? (
        <Link href={href(page + 1)} className="no-underline text-ink-mid hover:text-accent">
          Older →
        </Link>
      ) : (
        <span aria-hidden className="text-ink-soft opacity-40">
          Older →
        </span>
      )}
    </nav>
  )
}
