import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters } from '@/lib/chapters'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `${SITE_NAME} — читать целиком`,
  description:
    'Все 13 глав руководства по порядку: от мифов о силе воли и устройства мозга до плана на первые 30 дней, плато и перехода к набору мышц.',
  alternates: { canonical: `${SITE_URL}/guide` },
}

export default function GuideTOC() {
  return (
    <main className="prose-book" style={{ padding: '48px 20px 80px' }}>
      <nav style={{ fontSize: 15, margin: '0 0 32px' }}>
        <Link href="/" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
          ← На главную
        </Link>
      </nav>

      <p className="kicker">Руководство · 13 глав · 70 минут</p>

      <h1 style={{ marginBottom: '0.5em' }}>Руководство, которого у тебя никогда не было</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', margin: '0 0 2em' }}>
        Почему мы воюем с собственной природой вместо того, чтобы ей пользоваться
      </p>

      {/* Вступление книги: раньше оно лежало на главной, но там его место
          занял лендинг — а здесь оно и есть первая страница книги */}
      <p>
        Если ты читаешь эти строки, тебе сейчас, скорее всего, тяжело. Надоело каждый раз начинать
        всё с чистого листа. Надоело хотеть есть и сдерживать себя весь день, а вечером стоять у
        открытого холодильника. Знакомо это ощущение — вроде везде справляешься, а с едой никак?
      </p>
      <p>
        Дело тут не в еде и не в твоём характере. Всё проще: тебе никто толком не объяснил, как
        устроены твоё тело и мозг.
      </p>
      <p>
        Ты открыл это руководство, потому что хочешь изменить своё тело, но боишься. Боишься, что
        снова не хватит силы воли, а прошлые срывы будто доказывают твою несостоятельность. Так вот,
        они ничего про тебя не доказывают. С силой воли у тебя всё в порядке, просто тебя никто не
        научил, куда её направлять.
      </p>
      <p>
        Дальше будут объяснения, и ни одного приказа в духе «сделай вот так». Сначала разберём мифы,
        из-за которых прошлые попытки были обречены, и познакомимся с двумя силами внутри твоей
        головы: Всадником и Слоном. Потом посмотрим на факты: как горит жир, почему весы врут и
        откуда берётся голод.
      </p>
      <p>
        Быть «замотивированным» для этого не нужно, да и на одной мотивации далеко не уедешь. Нужно
        лишь разобраться, как здесь всё работает.
      </p>

      <hr />

      <p className="kicker" style={{ marginTop: '2.5em' }}>
        Оглавление
      </p>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/guide/${c.slug}`}
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'baseline',
                padding: '14px 0',
                borderBottom: '1px solid var(--line)',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <span className="num" style={{ color: 'var(--blue)', fontSize: 12, flex: '0 0 22px' }}>
                {String(c.order).padStart(2, '0')}
              </span>
              <span>{c.title}</span>
            </Link>
          </li>
        ))}
      </ol>

      <p style={{ marginTop: '2em', fontSize: 16 }}>
        <Link href="/glossary" style={{ color: 'var(--blue)' }}>
          Словарь терминов
        </Link>
        {' · '}
        <Link href="/blog" style={{ color: 'var(--blue)' }}>
          Разборы по темам
        </Link>
      </p>
    </main>
  )
}
