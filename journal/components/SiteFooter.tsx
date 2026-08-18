import Link from 'next/link'
import { AUTHOR } from '@/lib/site'
import { stats } from '@/lib/journal'
import { formatNumber } from '@/lib/format'

const LINKS = [
  { href: '/rss.xml', label: 'RSS', external: true },
  { href: '/search', label: 'Search', external: false },
  { href: AUTHOR.social.github, label: 'GitHub', external: true },
  { href: AUTHOR.social.linkedin, label: 'LinkedIn', external: true },
  { href: AUTHOR.social.x, label: 'X', external: true },
] as const

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule pt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 font-mach text-small text-ink-soft">
      <p className="m-0 tnum">
        {formatNumber(stats.entries)} entries · {formatNumber(stats.words)} words · written by hand
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 list-none m-0 p-0">
        {LINKS.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                className="no-underline hover:text-accent"
                {...(link.href.startsWith('http')
                  ? { rel: 'me noopener', target: '_blank' }
                  : {})}
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="no-underline hover:text-accent">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </footer>
  )
}
