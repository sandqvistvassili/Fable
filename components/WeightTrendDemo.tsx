'use client'

import WidgetFrame from './WidgetFrame'
import WeightChart from './WeightChart'

// Демонстрация «шум против тренда» на заранее заготовленных данных.
// Ничего не сохраняет и не привязана к читателю: 28 дней примерного веса
// с реалистичным дневным шумом вокруг медленно снижающегося тренда.
const DEMO_WEIGHTS = [
  86.4, 85.9, 86.8, 86.2, 85.6, 86.1, 85.4,
  85.9, 85.2, 86.3, 85.5, 85.0, 85.7, 84.9,
  85.3, 84.6, 85.8, 84.9, 84.4, 85.1, 84.6,
  84.9, 84.1, 85.2, 84.4, 83.9, 84.6, 84.1,
]

const points = DEMO_WEIGHTS.map((w, i) => ({ t: i, w }))

// Недельное среднее: семидневные блоки, точка в середине недели
const line = Array.from({ length: DEMO_WEIGHTS.length / 7 }, (_, week) => {
  const days = DEMO_WEIGHTS.slice(week * 7, week * 7 + 7)
  return {
    t: week * 7 + 3,
    w: days.reduce((s, v) => s + v, 0) / days.length,
  }
})

export default function WeightTrendDemo() {
  return (
    <WidgetFrame label="Демонстрация: шум и тренд">
      <WeightChart
        points={points}
        line={line}
        ariaLabel="Демонстрационный график веса за четыре недели: отдельные дни прыгают вверх и вниз, а линия недельного среднего плавно снижается"
      />
      <p
        style={{
          margin: '14px 0 0',
          fontSize: '14px',
          color: 'var(--panel-mute)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 18px',
        }}
      >
        <span>
          <span style={{ color: 'var(--panel-soft)' }}>●</span> отдельные дни
        </span>
        <span>
          <span style={{ color: 'var(--mint)' }}>—</span> недельное среднее
        </span>
      </p>
      <p className="panel-hint" style={{ margin: '10px 0 0', fontSize: '15px' }}>
        Так же будет выглядеть и твой график, когда начнёшь записывать свой вес ниже.
      </p>
    </WidgetFrame>
  )
}
