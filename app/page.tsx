import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters, totalMinutes } from '@/lib/chapters'
import { articles } from '@/lib/blog'
import glossary from '@/content/glossary-index.json'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: `${SITE_NAME} — о похудении без мифов`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
}

const WRAP: React.CSSProperties = { maxWidth: 1180, margin: '0 auto', padding: '0 24px' }

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ───────────────────────── обложка ───────────────────────── */}
        <section style={{ ...WRAP, paddingTop: 96, paddingBottom: 88 }}>
          <div style={{ maxWidth: 780 }}>
            <p className="kicker">
              Руководство · 13 глав · {totalMinutes} минут
            </p>
            <h1
              className="display"
              style={{
                fontSize: 'clamp(38px, 6.4vw, 66px)',
                margin: '0 0 28px',
                letterSpacing: '-0.035em',
              }}
            >
              Руководство, которого у тебя никогда не было
            </h1>
            <p
              style={{
                fontSize: 'clamp(18px, 2.2vw, 21px)',
                lineHeight: 1.6,
                color: 'var(--text-2)',
                maxWidth: '54ch',
                margin: '0 0 40px',
              }}
            >
              Почему мы воюем с собственной природой вместо того, чтобы ей пользоваться.
              Без мотивации, без запретов и без «просто соберись».
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Link className="btn" href={`/guide/${chapters[0].slug}`}>
                Начать читать
              </Link>
              <Link className="btn-ghost" href="/guide">
                Оглавление
              </Link>
            </div>
          </div>
        </section>

        {/* ────────────────── чем это отличается ───────────────────── */}
        <section style={{ ...WRAP, paddingBottom: 96 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 40,
              paddingTop: 48,
              borderTop: '1px solid var(--border)',
            }}
          >
            {[
              {
                t: 'Дело не в силе воли',
                d: 'Прошлые срывы ничего не доказывают про твой характер. Тебе просто никто не объяснил, как устроены тело и мозг — и куда направлять усилие, чтобы оно не тратилось впустую.',
              },
              {
                t: 'Объяснения, а не приказы',
                d: 'Здесь нет списков запрещённых продуктов и планов на тридцать дней. Есть механизм: почему весы врут, как на самом деле уходит жир, откуда берётся вечерний голод.',
              },
              {
                t: 'Ничего не копится',
                d: 'Никаких серий, очков и красных отметок за пропуск. В полночь счёт обнуляется — это не оформительское решение, а прямое следствие того, о чём книга.',
              },
            ].map((c) => (
              <div key={c.t}>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    margin: '0 0 10px',
                  }}
                >
                  {c.t}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15.5,
                    color: 'var(--text-2)',
                    lineHeight: 1.68,
                  }}
                >
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────── оглавление ─────────────────────── */}
        <section style={{ ...WRAP, paddingBottom: 96 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 28,
              gap: 20,
            }}
          >
            <h2
              className="display"
              style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', margin: 0 }}
            >
              Содержание
            </h2>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              <span className="num">{totalMinutes}</span> мин
            </span>
          </div>

          <ol className="chapter-list">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link href={`/guide/${c.slug}`}>
                  <span className="n">{String(c.order).padStart(2, '0')}</span>
                  <span className="t">{c.title}</span>
                  <span className="m"><span className="num">{c.minutes}</span> мин</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ─────────────────── инструменты и материалы ─────────────── */}
        <section style={{ ...WRAP, paddingBottom: 110 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {[
              {
                n: '3',
                t: 'Инструмента внутри текста',
                d: 'Калькулятор нормы, график «шум против тренда» и трекер веса — прямо в тех главах, где о них идёт речь. Всё считается в браузере, данные остаются на твоём устройстве.',
                href: `/guide/${chapters[5].slug}`,
              },
              {
                n: String(articles.length),
                t: 'Разбора с источниками',
                d: 'Отдельные вопросы вглубь: питание, тренировки, добавки, психология. Руководство отвечает «что делать», статьи — «почему именно так».',
                href: '/blog',
              },
              {
                n: String(glossary.terms.length),
                t: 'Термина в словаре',
                d: 'Сложные слова подчёркнуты прямо в тексте — определение открывается наведением, не прерывая чтения. Добавки подписаны и по-английски.',
                href: '/glossary',
              },
            ].map((c) => (
              <Link key={c.t} href={c.href} className="card" style={{ textDecoration: 'none' }}>
                <span
                  className="num"
                  style={{
                    fontSize: 30,
                    color: 'var(--text)',
                    letterSpacing: '-0.03em',
                    display: 'block',
                  }}
                >
                  {c.n}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 15.5,
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    margin: '10px 0 8px',
                    color: 'var(--text)',
                  }}
                >
                  {c.t}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 14.5,
                    color: 'var(--text-2)',
                    lineHeight: 1.62,
                  }}
                >
                  {c.d}
                </span>
              </Link>
            ))}
          </div>

          <p
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: '1px solid var(--border)',
              fontSize: 14,
              color: 'var(--text-3)',
              maxWidth: '68ch',
              lineHeight: 1.65,
            }}
          >
            Материал носит справочный характер и не заменяет консультацию врача. При
            хронических заболеваниях, беременности и постоянном приёме лекарств решения
            принимаются вместе со специалистом.{' '}
            <Link href={`/guide/${chapters[0].slug}`} style={{ color: 'var(--text-2)' }}>
              Подробнее — в первой главе
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  )
}
