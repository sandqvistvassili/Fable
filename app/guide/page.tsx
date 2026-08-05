import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters } from '@/lib/chapters'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `Оглавление — ${SITE_NAME}`,
  description:
    'Все 13 глав руководства по порядку: от мифов о силе воли и устройства мозга до плана на первые 30 дней, плато и перехода к набору мышц.',
  alternates: { canonical: `${SITE_URL}/guide` },
}

export default function GuideTOC() {
  return (
    <main className="prose-book" style={{ padding: '48px 20px 80px' }}>
      <p style={{ margin: '0 0 8px' }}>
        <Link href="/" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '15px' }}>
          ← На главную
        </Link>
      </p>
      <h1 style={{ fontSize: '1.9em', fontWeight: 600, margin: '0 0 24px' }}>Оглавление</h1>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {chapters.map((c) => (
          <li key={c.slug} style={{ margin: '0 0 10px' }}>
            <Link
              href={`/guide/${c.slug}`}
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'baseline',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <span className="num" style={{ color: 'var(--mute)', fontSize: '14px' }}>
                {String(c.order).padStart(2, '0')}
              </span>
              <span>{c.title}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p style={{ marginTop: '24px' }}>
        <Link href="/glossary" style={{ color: 'var(--blue)' }}>
          Карта терминов
        </Link>
      </p>
    </main>
  )
}
