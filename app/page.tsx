import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters } from '@/lib/chapters'
import { articles } from '@/lib/blog'
import glossary from '@/content/glossary-index.json'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  title: `${SITE_NAME} — о похудении без мифов`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
}

const WRAP: React.CSSProperties = { maxWidth: 1080, margin: '0 auto', padding: '0 24px' }

export default function Home() {
  return (
    <main>
      {/* ─────────────────────────── обложка ─────────────────────────── */}
      <section style={{ ...WRAP, paddingTop: 64, paddingBottom: 56 }}>
        <p className="kicker">
          Руководство · 13 глав · 70 минут
        </p>
        <h1
          className="display"
          style={{ fontSize: 'clamp(36px, 7.2vw, 68px)', margin: '0 0 24px', maxWidth: '15ch' }}
        >
          Руководство, которого у тебя никогда не было
        </h1>
        <p
          style={{
            fontSize: 'clamp(18px, 2.4vw, 21px)',
            lineHeight: 1.58,
            color: 'var(--ink-soft)',
            maxWidth: '52ch',
            margin: '0 0 36px',
          }}
        >
          Почему мы воюем с собственной природой вместо того, чтобы ей пользоваться.
          Без мотивации, без запретов и без «просто соберись».
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <Link className="btn" href={`/guide/${chapters[0].slug}`}>
            Начать читать
          </Link>
          <Link className="btn-ghost" href="/guide">
            Оглавление
          </Link>
        </div>
        <p
          className="kicker"
          style={{ color: 'var(--mute)', margin: 0, letterSpacing: '0.1em' }}
        >
          Без регистрации · Данные не покидают браузер
        </p>
      </section>

      {/* ────────────────────── о чём это и для кого ─────────────────── */}
      <section style={{ ...WRAP, paddingBottom: 56 }}>
        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '0 0 44px' }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 36,
          }}
        >
          <div>
            <h2 className="display" style={{ fontSize: 17, margin: '0 0 12px' }}>
              Дело не в силе воли
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.68 }}>
              Прошлые срывы ничего не доказывают про твой характер. Тебе просто никто не объяснил,
              как устроены твоё тело и мозг — и куда направлять усилие, чтобы оно не тратилось
              впустую.
            </p>
          </div>
          <div>
            <h2 className="display" style={{ fontSize: 17, margin: '0 0 12px' }}>
              Объяснения, а не приказы
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.68 }}>
              Здесь нет списков запрещённых продуктов и планов на тридцать дней. Есть механизм:
              почему весы врут, как на самом деле уходит жир, откуда берётся вечерний голод.
            </p>
          </div>
          <div>
            <h2 className="display" style={{ fontSize: 17, margin: '0 0 12px' }}>
              Ничего не копится
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.68 }}>
              Никаких серий, очков и красных отметок за пропуск. В полночь счёт обнуляется — это
              не оформительское решение, а прямое следствие того, о чём книга.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── инструменты ───────────────────────── */}
      <section
        style={{
          background: 'var(--panel)',
          padding: '64px 0',
          margin: '8px 0 0',
        }}
      >
        <div style={WRAP}>
          <p className="kicker" style={{ color: 'var(--mint)' }}>
            Инструменты внутри текста
          </p>
          <h2
            className="display"
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              color: 'var(--panel-ink)',
              margin: '0 0 14px',
              maxWidth: '20ch',
            }}
          >
            Считает не читатель, а страница
          </h2>
          <p
            style={{
              color: 'var(--panel-soft)',
              maxWidth: '54ch',
              margin: '0 0 36px',
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            Три инструмента стоят прямо в главах — там, где о них идёт речь. Работают в браузере,
            без аккаунта: введённое остаётся на твоём устройстве.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 14,
            }}
          >
            {[
              {
                n: '2 340',
                u: 'ккал',
                t: 'Калькулятор',
                d: 'Расход, бюджет с дефицитом и норма белка по формуле Миффлина — Сан Жеора.',
                href: `/guide/${chapters[5].slug}`,
              },
              {
                n: '±1,4',
                u: 'кг',
                t: 'Шум против тренда',
                d: 'Почему отдельные взвешивания прыгают, а недельное среднее спокойно идёт вниз.',
                href: `/guide/${chapters[4].slug}`,
              },
              {
                n: '91,2',
                u: 'кг',
                t: 'Трекер веса',
                d: 'Свои цифры, недельное среднее и график. Без серий и без очков.',
                href: `/guide/${chapters[10].slug}`,
              },
            ].map((c) => (
              <Link
                key={c.t}
                href={c.href}
                style={{
                  display: 'block',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--panel-line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  textDecoration: 'none',
                }}
              >
                <span
                  className="num"
                  style={{ fontSize: 30, color: 'var(--mint)', display: 'block', lineHeight: 1.1 }}
                >
                  {c.n}
                  <span style={{ fontSize: 14, color: 'var(--panel-mute)' }}> {c.u}</span>
                </span>
                <span
                  className="display"
                  style={{
                    display: 'block',
                    fontSize: 15,
                    color: 'var(--panel-ink)',
                    margin: '12px 0 6px',
                  }}
                >
                  {c.t}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 14.5,
                    color: 'var(--panel-soft)',
                    lineHeight: 1.55,
                  }}
                >
                  {c.d}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── оглавление ───────────────────────── */}
      <section style={{ ...WRAP, padding: '64px 24px 56px' }}>
        <p className="kicker">Что внутри</p>
        <h2
          className="display"
          style={{ fontSize: 'clamp(26px, 4vw, 38px)', margin: '0 0 32px', maxWidth: '18ch' }}
        >
          Тринадцать глав, читаются подряд
        </h2>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'ch' }}>
          {chapters.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/guide/${c.slug}`}
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'baseline',
                  padding: '15px 0',
                  borderBottom: '1px solid var(--line)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="num"
                  style={{ color: 'var(--blue)', fontSize: 12, flex: '0 0 24px' }}
                >
                  {String(c.order).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 18 }}>{c.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ──────────────────────── статьи и словарь ───────────────────── */}
      <section style={{ ...WRAP, paddingBottom: 80 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          <Link
            href="/blog"
            style={{
              display: 'block',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '26px 28px',
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <span className="num" style={{ fontSize: 34, color: 'var(--blue)' }}>
              {articles.length}
            </span>
            <span
              className="display"
              style={{ display: 'block', fontSize: 16, margin: '10px 0 8px' }}
            >
              Разборов с источниками
            </span>
            <span style={{ display: 'block', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Отдельные вопросы вглубь: питание, тренировки, добавки, психология. Руководство
              отвечает «что делать», статьи — «почему именно так».
            </span>
          </Link>

          <Link
            href="/glossary"
            style={{
              display: 'block',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '26px 28px',
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <span className="num" style={{ fontSize: 34, color: 'var(--blue)' }}>
              {glossary.terms.length}
            </span>
            <span
              className="display"
              style={{ display: 'block', fontSize: 16, margin: '10px 0 8px' }}
            >
              Терминов в словаре
            </span>
            <span style={{ display: 'block', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Сложные слова подчёркнуты прямо в тексте — определение открывается наведением, не
              прерывая чтения. Добавки подписаны и по-английски.
            </span>
          </Link>
        </div>

        <p
          style={{
            marginTop: 44,
            paddingTop: 28,
            borderTop: '1px solid var(--line)',
            fontSize: 15,
            color: 'var(--mute)',
            maxWidth: '62ch',
          }}
        >
          Материал носит справочный характер и не заменяет консультацию врача. При хронических
          заболеваниях, беременности и постоянном приёме лекарств решения принимаются вместе со
          специалистом.{' '}
          <Link href={`/guide/${chapters[0].slug}`} style={{ color: 'var(--mute)' }}>
            Подробнее — в первой главе
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
