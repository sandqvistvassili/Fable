import Link from 'next/link'
import type { Metadata } from 'next'
import glossary from '@/content/glossary-index.json'
import { articles } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'
import GlossaryBrowser from '@/components/GlossaryBrowser'

export const metadata: Metadata = {
  title: 'Словарь терминов о питании, теле и тренировках',
  description:
    'Что такое дефицит калорий, TDEE, адаптивный термогенез, липолиз и ещё тысяча терминов — короткие объяснения простым языком, с английскими названиями добавок.',
  alternates: { canonical: `${SITE_URL}/glossary` },
}

export default function GlossaryPage() {
  // Заголовки только опубликованных статей: на придержанные ссылок нет
  const articleTitles: Record<string, string> = {}
  for (const a of articles) articleTitles[a.slug] = a.title

  return (
    <main style={{ padding: '48px 20px 80px', maxWidth: 780, margin: '0 auto' }}>
      <nav aria-label="Хлебные крошки" style={{ fontSize: '15px', margin: '0 0 20px' }}>
        <Link href="/guide" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
          Руководство
        </Link>
        <span style={{ color: 'var(--mute)' }}> / </span>
        <span style={{ color: 'var(--ink-soft)' }}>Словарь</span>
      </nav>

      <h1 style={{ fontSize: '1.9em', fontWeight: 600, margin: '0 0 12px' }}>Словарь</h1>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 24px' }}>
        <span className="num">{glossary.terms.length}</span> терминов из руководства и статей.
        В тексте сложные слова подчёркнуты точками — определение открывается наведением или
        касанием, не прерывая чтения. Добавки подписаны и по-английски: под этими названиями
        их ищут и продают.
      </p>

      <GlossaryBrowser articleTitles={articleTitles} />
    </main>
  )
}
