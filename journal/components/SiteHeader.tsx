import Link from 'next/link'
import { AUTHOR } from '@/lib/site'

const NAV = [
  { href: '/journal', label: 'Journal' },
  { href: '/topics', label: 'Topics' },
  { href: '/stats', label: 'Stats' },
  { href: '/now', label: 'Now' },
  { href: '/about', label: 'About' },
] as const

export default function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-rule pb-4">
      <Link
        href="/"
        className="flex flex-col gap-0.5 no-underline"
        aria-label={`${AUTHOR.name} — home`}
      >
        <span className="text-step-2 font-semibold tracking-tight leading-tight">{AUTHOR.name}</span>
        <span className="font-mach text-small text-ink-soft">{AUTHOR.tagline}</span>
      </Link>

      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mach text-small list-none m-0 p-0">
          {NAV.map((item) => {
            const active = current === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'no-underline text-ink border-b border-accent pb-0.5'
                      : 'no-underline text-ink-mid hover:text-accent'
                  }
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
