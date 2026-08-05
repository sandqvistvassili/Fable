import Link from 'next/link'
import type { Metadata } from 'next'
import { articles, categories, articlesByCategory } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'
import CategoryNav from '@/components/CategoryNav'
import ArticleCard from '@/components/ArticleCard'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Статьи о питании, тренировках и психологии — с источниками',
  description:
    'Разборы по питанию, жиросжиганию, тренировкам, добавкам и психологии: механизм, доказательная база и что из этого следует на практике.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogIndex() {
  return (
    <>
    <SiteHeader />
    <main style={{ padding: '64px 24px 96px', maxWidth: 1180, margin: '0 auto' }}>
      <p className="kicker">Разборы по темам</p>
      <h1 className="display" style={{ fontSize: 'clamp(30px, 4.4vw, 44px)', margin: '0 0 14px' }}>
        Статьи
      </h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 680, margin: '0 0 28px' }}>
        Разборы отдельных вопросов с механизмом и источниками. Руководство отвечает на вопрос
        «что делать», статьи — на вопрос «почему именно так».{' '}
        <Link href="/guide" style={{ color: 'var(--blue)' }}>
          Читать руководство
        </Link>
        .
      </p>

      <CategoryNav />

      {categories.map((c) => {
        const list = articlesByCategory(c.id)
        if (list.length === 0) return null
        return (
          <section key={c.id} style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '1.2em',
                fontWeight: 600,
                margin: '0 0 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <Link href={`/blog/topic/${c.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                {c.name}
              </Link>
              <Link
                href={`/blog/topic/${c.id}`}
                className="num"
                style={{ fontSize: '14px', fontWeight: 400, color: 'var(--mute)', textDecoration: 'none' }}
              >
                все {list.length} →
              </Link>
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {list.slice(0, 6).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </ul>
          </section>
        )
      })}

      <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>
        Всего статей: <span className="num">{articles.length}</span>
      </p>
    </main>
    </>
  )
}
