import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { categories, getCategory, articlesByCategory } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'
import CategoryNav from '@/components/CategoryNav'
import ArticleCard from '@/components/ArticleCard'

export const dynamicParams = false

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const c = getCategory(category)
  if (!c) return {}
  const n = articlesByCategory(category).length
  return {
    title: `${c.name} — статьи с разбором механизма и источников`,
    description: `${c.name.toLowerCase()}: ${n} разборов с механизмом, доказательной базой и практическими выводами. Без мотивационной риторики.`,
    alternates: { canonical: `${SITE_URL}/blog/topic/${c.id}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const c = getCategory(category)
  if (!c) notFound()
  const list = articlesByCategory(category)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Статьи', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE_URL}/blog/topic/${c.id}` },
    ],
  }

  return (
    <main style={{ padding: '48px 20px 80px', maxWidth: 980, margin: '0 auto' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Хлебные крошки" style={{ fontSize: '15px', margin: '0 0 16px' }}>
        <Link href="/blog" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
          Статьи
        </Link>
        <span style={{ color: 'var(--mute)' }}> / </span>
        <span style={{ color: 'var(--ink-soft)' }}>{c.name}</span>
      </nav>

      <h1 style={{ fontSize: '1.9em', fontWeight: 600, margin: '0 0 10px' }}>{c.name}</h1>
      <p style={{ color: 'var(--mute)', margin: '0 0 24px' }}>
        <span className="num">{list.length}</span> статей
      </p>

      <CategoryNav active={c.id} />

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
        {list.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </ul>
    </main>
  )
}
