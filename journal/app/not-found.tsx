import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-4">
        <p className="m-0 font-mach text-micro uppercase tracking-[0.14em] text-accent">404</p>
        <h1 className="m-0 text-step-3 font-semibold tracking-tight">
          There is nothing at this address
        </h1>
        <p className="m-0 max-w-[38em] text-ink-mid">
          The server understood the request perfectly — there is just no page here. The{' '}
          <Link href="/journal">journal</Link> has everything that exists, and{' '}
          <Link href="/search">search</Link> can find it.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
