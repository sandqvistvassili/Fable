import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters, totalMinutes } from '@/lib/chapters'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: `${SITE_NAME} — читать целиком`,
  description:
    'Все 13 глав руководства по порядку: от мифов о силе воли и устройства мозга до плана на первые 30 дней, плато и перехода к набору мышц.',
  alternates: { canonical: `${SITE_URL}/guide` },
}

export default function GuideTOC() {
  return (
    <>
      <SiteHeader />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px 110px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="kicker">Руководство · 13 глав · {totalMinutes} минут</p>

          <h1
            className="display"
            style={{
              fontSize: 'clamp(32px, 5vw, 50px)',
              margin: '0 0 20px',
              letterSpacing: '-0.032em',
            }}
          >
            Руководство, которого у тебя никогда не было
          </h1>
          <p
            style={{
              fontSize: 19,
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: '0 0 56px',
            }}
          >
            Почему мы воюем с собственной природой вместо того, чтобы ей пользоваться
          </p>

          {/* Вступление книги — её первая страница */}
          <div className="prose-book" style={{ maxWidth: 'none' }}>
            <p>
              Если ты читаешь эти строки, тебе сейчас, скорее всего, тяжело. Надоело каждый раз
              начинать всё с чистого листа. Надоело хотеть есть и сдерживать себя весь день, а
              вечером стоять у открытого холодильника. Знакомо это ощущение — вроде везде
              справляешься, а с едой никак?
            </p>
            <p>
              Дело тут не в еде и не в твоём характере. Всё проще: тебе никто толком не объяснил,
              как устроены твоё тело и мозг.
            </p>
            <p>
              Ты открыл это руководство, потому что хочешь изменить своё тело, но боишься.
              Боишься, что снова не хватит силы воли, а прошлые срывы будто доказывают твою
              несостоятельность. Так вот, они ничего про тебя не доказывают. С силой воли у тебя
              всё в порядке, просто тебя никто не научил, куда её направлять.
            </p>
            <p>
              Дальше будут объяснения, и ни одного приказа в духе «сделай вот так». Сначала
              разберём мифы, из-за которых прошлые попытки были обречены, и познакомимся с двумя
              силами внутри твоей головы: Всадником и Слоном. Потом посмотрим на факты: как горит
              жир, почему весы врут и откуда берётся голод.
            </p>
            <p>
              Быть «замотивированным» для этого не нужно, да и на одной мотивации далеко не
              уедешь. Нужно лишь разобраться, как здесь всё работает.
            </p>
          </div>

          <div style={{ marginTop: 72 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
                Содержание
              </h2>
              <span className="num" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                {totalMinutes} мин
              </span>
            </div>

            <ol className="chapter-list">
              {chapters.map((c) => (
                <li key={c.slug}>
                  <Link href={`/guide/${c.slug}`}>
                    <span className="n">{String(c.order).padStart(2, '0')}</span>
                    <span className="t">{c.title}</span>
                    <span className="m">{c.minutes} мин</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>
    </>
  )
}
