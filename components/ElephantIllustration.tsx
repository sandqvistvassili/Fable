// Пара статичных иллюстраций к главе «Всадник и Слон»: оба состояния Слона
// показаны одновременно, без переключателей.
//
// Чтобы добавить иллюстрацию Всадника, когда она появится: положи файл в
// public/elephant/ (например rider.png) и допиши один элемент в массив ниже —
// вёрстка сетки подхватит третью карточку автоматически.
const illustrations = [
  {
    src: '/elephant/elephant-calm.png',
    caption: 'Слон спокоен',
    alt: 'Умиротворённый слон стоит расслабленно, уши опущены — лимбическая система в покое: Всадник держит поводья, решения принимаются осознанно',
  },
  {
    src: '/elephant/elephant-anxious.png',
    caption: 'Слон встревожен',
    alt: 'Взбудораженный слон с распахнутыми ушами и напряжённой позой — лимбическая система в стрессе: команды разума перестают работать, животное идёт к еде',
  },
  // { src: '/elephant/rider.png', caption: 'Всадник', alt: '…' },
]

export default function ElephantIllustration() {
  return (
    <figure
      style={{
        margin: '32px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      {illustrations.map((img) => (
        <figure
          key={img.src}
          style={{
            margin: 0,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            width={900}
            height={900}
            loading="lazy"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <figcaption
            style={{
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '15px',
              color: 'var(--ink-soft)',
            }}
          >
            {img.caption}
          </figcaption>
        </figure>
      ))}
    </figure>
  )
}
