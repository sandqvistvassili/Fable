'use client'

import { useEffect, useState } from 'react'
import WidgetFrame from './WidgetFrame'

/**
 * Расписание дня по трём правилам первого месяца.
 *
 * Глава просит завести пять будильников и есть каждые 2,5–3 часа, а воду
 * пить так: 500 мл сразу после пробуждения и по стакану перед каждым
 * приёмом. Виджет всего лишь считает эти времена от часа подъёма — вся
 * арифметика взята из текста, ничего сверху не добавлено.
 *
 * Интервал выбирает читатель, потому что в главе он задан вилкой, а не
 * одним числом. Ни отметок о выполнении, ни истории здесь нет: это
 * расписание, а не дневник.
 */

const KEY = 'guide:schedule'

const MEALS = 5
const DEFAULT_WAKE = 7 * 60 // 07:00
const GLASS_ML = 250
const MORNING_ML = 500

// Вилка из главы: 2,5–3 часа между приёмами
const INTERVALS = [
  { min: 150, label: '2,5 ч' },
  { min: 165, label: '2 ч 45 мин' },
  { min: 180, label: '3 ч' },
]

function parseTime(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function formatTime(total: number): string {
  const t = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

export default function DaySchedule() {
  const [mounted, setMounted] = useState(false)
  const [wake, setWake] = useState(formatTime(DEFAULT_WAKE))
  const [gap, setGap] = useState(165)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.wake === 'string' && parseTime(s.wake) !== null) setWake(s.wake)
        if (INTERVALS.some((i) => i.min === s.gap)) setGap(s.gap)
      }
    } catch {
      // повреждённая запись — остаются значения по умолчанию
    }
    setMounted(true)
  }, [])

  const save = (next: { wake: string; gap: number }) => {
    setWake(next.wake)
    setGap(next.gap)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // приватный режим: расписание живёт до перезагрузки
    }
  }

  if (!mounted) {
    return (
      <WidgetFrame label="Расписание дня">
        <p className="panel-hint" style={{ margin: 0 }}>
          Загрузка…
        </p>
      </WidgetFrame>
    )
  }

  // Минуты выбираются с шагом в пять, поэтому и час подъёма округляем так же
  const start = Math.floor((parseTime(wake) ?? DEFAULT_WAKE) / 5) * 5
  const water = (MORNING_ML + MEALS * GLASS_ML) / 1000
  const wakeH = Math.floor(start / 60)
  const wakeM = start % 60

  const setWakeParts = (h: number, m: number) =>
    save({ wake: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, gap })

  return (
    <WidgetFrame label="Расписание дня">
      <div className="day-controls">
        <div>
          <span className="day-seg-label">Во сколько встаёшь</span>
          {/* Свои списки часов и минут вместо input[type=time]: тот показывает
              AM/PM по языку браузера, а всё расписание ниже — двадцатичетырёхчасовое */}
          <div className="day-clock">
            <select
              aria-label="Час подъёма"
              value={wakeH}
              onChange={(e) => setWakeParts(Number(e.target.value), wakeM)}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span aria-hidden="true">:</span>
            <select
              aria-label="Минуты подъёма"
              value={wakeM}
              onChange={(e) => setWakeParts(wakeH, Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, k) => (
                <option key={k} value={k * 5}>
                  {String(k * 5).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <span className="day-seg-label">Интервал между приёмами</span>
          <div className="day-seg">
            {INTERVALS.map((i) => (
              <button
                key={i.min}
                type="button"
                aria-pressed={gap === i.min}
                onClick={() => save({ wake, gap: i.min })}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="day-lead">
        Сразу после пробуждения — {MORNING_ML} мл воды, до кофе. В каждый приём белок и стакан
        воды перед едой.
      </p>

      <ol className="day-timeline">
        {Array.from({ length: MEALS }, (_, k) => {
          const at = start + k * gap
          return (
            <li key={k} className="day-row">
              <span className="day-time num">
                {formatTime(at)}
                {at >= 1440 && <span className="day-next">+1</span>}
              </span>
              <span className="day-what">
                Приём <span className="num">{k + 1}</span>
              </span>
            </li>
          )
        })}
      </ol>

      {/* Сводка — это проза, а не показания прибора, поэтому без моноширинных цифр */}
      <p className="day-total">
        Пять будильников, последний в {formatTime(start + (MEALS - 1) * gap)}. Вода за день:{' '}
        {MORNING_ML} мл утром и {MEALS} стаканов по {GLASS_ML} мл — это{' '}
        {water.toFixed(2).replace(/0$/, '').replace('.', ',')} л, внутри коридора 1,5–2,5 л из
        главы. Плюс 7000–8000 шагов, набирать постепенно.
      </p>

      <p className="day-note">
        Сигнал сработал — садишься и ешь, даже если голода пока нет. Пропустил будильник на час —
        не удваивай порцию: выпей воды, съешь свою норму белка, перезапусти таймер.
      </p>
    </WidgetFrame>
  )
}
