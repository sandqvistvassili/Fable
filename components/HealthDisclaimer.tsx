import Link from 'next/link'

// Общая оговорка для статей о питании, добавках и здоровье. В руководстве
// под это отведена отдельная глава, у статей своей не было.
export default function HealthDisclaimer() {
  return (
    <p
      style={{
        margin: '32px 0 0',
        paddingTop: '16px',
        borderTop: '1px solid var(--line)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--mute)',
      }}
    >
      Материал носит справочный характер и не заменяет консультацию врача. При хронических
      заболеваниях, беременности и постоянном приёме лекарств решения об изменении питания,
      нагрузок или приёме добавок принимаются вместе со специалистом.{' '}
      <Link href="/guide/prezhde-chem-nachat-komu-ne-podojdet" style={{ color: 'var(--mute)' }}>
        Подробнее — в главе «Прежде чем начать»
      </Link>
      .
    </p>
  )
}
