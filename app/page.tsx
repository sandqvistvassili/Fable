import Link from 'next/link'
import type { Metadata } from 'next'
import { chapters } from '@/lib/chapters'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  title: `${SITE_NAME} — книга о похудении без мифов`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
}

export default function Home() {
  return (
    <main className="prose-book" style={{ padding: '64px 20px 80px' }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 6vw, 40px)',
          lineHeight: 1.2,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: '0 0 12px',
        }}
      >
        Руководство, которого у тебя никогда не было
      </h1>
      <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic', margin: '0 0 32px' }}>
        Почему мы воюем с собственной природой вместо того, чтобы ей пользоваться
      </p>

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

      <div style={{ margin: '40px 0', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          href={`/book/${chapters[0].slug}`}
          style={{
            display: 'inline-block',
            background: 'var(--blue)',
            color: '#fff',
            padding: '13px 28px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Читать
        </Link>
        <Link
          href="/book"
          style={{
            display: 'inline-block',
            background: 'var(--card)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            padding: '13px 28px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
          }}
        >
          Оглавление
        </Link>
      </div>

      <p style={{ color: 'var(--mute)', fontSize: '15px' }}>
        13 глав, около 70 минут чтения. Без регистрации: инструменты внутри книги работают
        прямо в браузере, данные не покидают твоё устройство.
      </p>
    </main>
  )
}
