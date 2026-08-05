import Link from 'next/link'
import type { Metadata } from 'next'
import { glossary } from '@/lib/glossary'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Словарь терминов о похудении: простыми словами',
  description:
    'Что такое дефицит калорий, TDEE, адаптивный термогенез и другие термины похудения — объяснение простым языком.',
  alternates: { canonical: `${SITE_URL}/glossary` },
}

export default function GlossaryPage() {
  return (
    <main className="prose-book" style={{ padding: '48px 20px 80px' }}>
      <nav aria-label="Хлебные крошки" style={{ fontSize: '15px', margin: '0 0 24px' }}>
        <Link href="/guide" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
          Руководство
        </Link>
        <span style={{ color: 'var(--mute)' }}> / </span>
        <span style={{ color: 'var(--ink-soft)' }}>Карта терминов</span>
      </nav>
      <h1 style={{ fontSize: '1.9em', fontWeight: 600, margin: '0 0 12px' }}>Карта терминов</h1>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 32px' }}>
        Ключевые понятия руководства в одном месте. В тексте глав каждый термин подчёркнут
        пунктиром — определение открывается по клику, не прерывая чтения.
      </p>
      <dl style={{ margin: 0 }}>
        {glossary.map((t) => (
          <div
            key={t.id}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              marginBottom: '12px',
            }}
          >
            <dt style={{ fontWeight: 600, marginBottom: '6px' }}>{t.name}</dt>
            <dd style={{ margin: 0, color: 'var(--ink-soft)' }}>{t.definition}</dd>
          </div>
        ))}
      </dl>
    </main>
  )
}
