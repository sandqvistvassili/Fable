import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import CopyButton from '@/components/CopyButton'
import { notes, getEntry } from '@/lib/journal'
import { linkedinPost, linkedinComment, linkedinLength, xThread } from '@/lib/share'
import { LIMITS } from '@/lib/site'
import { formatDay, formatNumber } from '@/lib/format'

export const dynamicParams = false

export function generateStaticParams() {
  return notes.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) return {}
  return {
    title: `Share — ${entry.title}`,
    // A tooling page for the author; search engines have no business here.
    robots: { index: false, follow: false },
  }
}

function Card({
  title,
  note,
  copyText,
  children,
}: {
  title: string
  note: string
  copyText: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col rounded-[3px] border border-rule bg-sunk">
      <header className="flex items-center justify-between gap-3 border-b border-rule px-3.5 py-2.5">
        <h2 className="m-0 font-mach text-micro font-normal uppercase tracking-[0.1em] text-ink-soft">
          {title}
        </h2>
        <CopyButton text={copyText} />
      </header>
      <div className="whitespace-pre-wrap px-3.5 py-3 font-mach text-small leading-relaxed text-ink-mid">
        {children}
      </div>
      <footer className="border-t border-rule px-3.5 py-2 font-mach text-micro text-ink-soft tnum">
        {note}
      </footer>
    </section>
  )
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry || entry.type !== 'note') notFound()

  const post = linkedinPost(entry)
  const comment = linkedinComment(entry)
  const { length, warn, over } = linkedinLength(entry)
  const thread = xThread(entry)
  const overTweets = thread.filter((t) => t.over).length

  return (
    <>
      <SiteHeader current="/journal" />
      <main id="main" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="m-0 font-mach text-micro uppercase tracking-[0.1em] text-ink-soft tnum">
            Day {formatDay(entry.day)} · share
          </p>
          <h1 className="m-0 text-step-2 font-semibold tracking-tight [text-wrap:balance]">
            {entry.title}
          </h1>
          <p className="m-0 font-mach text-small">
            <Link href={entry.path} className="text-ink-mid no-underline hover:text-accent">
              ← Back to the entry
            </Link>
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            title="LinkedIn post"
            copyText={post}
            note={
              over
                ? `${formatNumber(length)} / ${formatNumber(LIMITS.linkedinLimit)} characters — TOO LONG, trim the entry`
                : warn
                  ? `${formatNumber(length)} / ${formatNumber(LIMITS.linkedinLimit)} characters — close to the limit`
                  : `${formatNumber(length)} / ${formatNumber(LIMITS.linkedinLimit)} characters · plain text, markdown stripped`
            }
          >
            {post}
          </Card>

          <div className="flex flex-col gap-4">
            <Card
              title="First comment"
              copyText={comment}
              note="The link goes in the first comment, not the post — LinkedIn suppresses reach on posts that link out."
            >
              {comment}
            </Card>

            <Card
              title={`X thread · ${thread.length} posts`}
              copyText={thread.map((t) => t.text).join('\n\n---\n\n')}
              note={
                overTweets
                  ? `${overTweets} post(s) over ${LIMITS.xLimit} characters — shorten before posting`
                  : `Every post fits in ${LIMITS.xLimit} characters. "---" separates posts.`
              }
            >
              {thread.map((t, i) => (
                <div key={i} className={i ? 'mt-3 border-t border-rule pt-3' : ''}>
                  <span className={t.over ? 'text-accent' : undefined}>{t.text}</span>
                  <span className="mt-1 block text-micro text-ink-soft tnum">
                    {t.length} / {LIMITS.xLimit}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
