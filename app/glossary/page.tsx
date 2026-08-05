import Link from 'next/link'
import type { Metadata } from 'next'
import glossary from '@/content/glossary-index.json'
import { articles } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'
import GlossaryBrowser from '@/components/GlossaryBrowser'
import SiteHeader from '@/components/SiteHeader'

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
    <>
    <SiteHeader />
    <main style={{ padding: '64px 24px 96px', maxWidth: 820, margin: '0 auto' }}>
      <p className="kicker">Термины руководства и статей</p>
      <h1 className="display" style={{ fontSize: 'clamp(30px, 4.4vw, 44px)', margin: '0 0 14px' }}>
        Словарь
      </h1>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 24px' }}>
        <span className="num">{glossary.terms.length}</span> терминов из руководства и статей.
        В тексте сложные слова подчёркнуты точками — определение открывается наведением или
        касанием, не прерывая чтения. Добавки подписаны и по-английски: под этими названиями
        их ищут и продают.
      </p>

      <GlossaryBrowser articleTitles={articleTitles} />
    </main>
    </>
  )
}
