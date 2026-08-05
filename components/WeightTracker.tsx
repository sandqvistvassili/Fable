'use client'

import { useEffect, useMemo, useState } from 'react'
import WidgetFrame from './WidgetFrame'
import WeightChart from './WeightChart'

// Живой трекер веса. Данные живут только в localStorage этого браузера:
// без аккаунта и без сервера. Сознательно нет серий, очков и подсветки
// пропущенных дней — это прямое следствие текста книги (глава про ЕЕП):
// пропущенный день просто отсутствует, в полночь ничего не «сгорает».

const STORAGE_KEY = 'kniga:weight-entries'

type Entry = { date: string; weight: number }

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (e): e is Entry =>
          typeof e?.date === 'string' && typeof e?.weight === 'number' && e.weight > 0,
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

function saveEntries(entries: Entry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // приватный режим или переполненное хранилище — трекер продолжит
    // работать до перезагрузки страницы
  }
}

/** Понедельник календарной недели, к которой относится дата */
function weekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = (d.getDay() + 6) % 7 // 0 = понедельник
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function dayNumber(dateStr: string): number {
  return Math.round(Date.parse(`${dateStr}T12:00:00`) / 86_400_000)
}

/** Недельное среднее по формуле книги: три последних записи недели, сумма / 3 */
function weeklyAverages(entries: Entry[]) {
  const byWeek = new Map<string, Entry[]>()
  for (const e of entries) {
    const key = weekStart(e.date)
    const list = byWeek.get(key) ?? []
    list.push(e)
    byWeek.set(key, list)
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, list]) => {
      const lastThree = list.slice(-3)
      return {
        week,
        count: list.length,
        complete: lastThree.length === 3,
        avg: lastThree.reduce((s, e) => s + e.weight, 0) / lastThree.length,
      }
    })
}

const fieldStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontSize: '16px',
  fontFamily: 'var(--font-text)',
  width: '100%',
}

export default function WeightTracker() {
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [date, setDate] = useState('')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    setEntries(loadEntries())
    const now = new Date()
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    setDate(local.toISOString().slice(0, 10))
    setMounted(true)
  }, [])

  const weeks = useMemo(() => weeklyAverages(entries), [entries])
  const completeWeeks = weeks.filter((w) => w.complete)
  const current = completeWeeks[completeWeeks.length - 1]
  const previous = completeWeeks[completeWeeks.length - 2]
  const delta = current && previous ? current.avg - previous.avg : null

  const points = entries.map((e) => ({ t: dayNumber(e.date), w: e.weight }))
  const line = weeks
    .filter((w) => w.complete)
    .map((w) => ({ t: dayNumber(w.week) + 3, w: w.avg }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const w = Number(weight.replace(',', '.'))
    if (!date || !w || w < 20 || w > 400) return
    const next = [...entries.filter((x) => x.date !== date), { date, weight: w }].sort(
      (a, b) => a.date.localeCompare(b.date),
    )
    setEntries(next)
    saveEntries(next)
    setWeight('')
  }

  const remove = (dateStr: string) => {
    const next = entries.filter((x) => x.date !== dateStr)
    setEntries(next)
    saveEntries(next)
  }

  return (
    <WidgetFrame label="Твой трекер веса">
      {mounted && current && (
        <div style={{ marginBottom: '16px' }}>
          <span className="num" style={{ fontSize: '34px', fontWeight: 500 }}>
            {current.avg.toFixed(1)}
            <span style={{ fontSize: '16px', color: 'var(--mute)' }}> кг</span>
          </span>
          <span style={{ display: 'block', fontSize: '14px', color: 'var(--ink-soft)' }}>
            Недельное среднее
            {delta !== null && (
              <>
                {' · '}
                <span className="num" style={{ color: delta <= 0 ? 'var(--done)' : 'var(--ink-soft)' }}>
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)} кг
                </span>{' '}
                за неделю
              </>
            )}
          </span>
        </div>
      )}

      {mounted && entries.length === 0 && (
        <p style={{ margin: '0 0 16px', color: 'var(--ink-soft)' }}>
          Начни записывать вес здесь, чтобы видеть тренд, а не шум. Данные остаются в твоём
          браузере.
        </p>
      )}

      {mounted && entries.length > 0 && (
        <WeightChart
          points={points}
          line={line}
          ariaLabel="График твоих взвешиваний: бледные точки — отдельные дни, синяя линия — недельное среднее"
        />
      )}

      {mounted && entries.length > 0 && !current && (
        <p style={{ margin: '10px 0 16px', fontSize: '14px', color: 'var(--mute)' }}>
          Недельное среднее появится после трёх записей за одну календарную неделю. Записей
          на этой неделе: <span className="num">{weeks[weeks.length - 1]?.count ?? 0}</span>.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          alignItems: 'end',
          marginTop: entries.length > 0 ? '16px' : 0,
        }}
      >
        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
            Дата
          </span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} required />
        </label>
        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
            Вес, кг
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={20}
            max={400}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={fieldStyle}
            required
          />
        </label>
        <button
          type="submit"
          style={{
            padding: '11px 20px',
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '16px',
            fontFamily: 'var(--font-text)',
            cursor: 'pointer',
          }}
        >
          Записать
        </button>
      </form>

      {mounted && entries.length > 0 && (
        <details style={{ marginTop: '16px', fontSize: '15px' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--ink-soft)' }}>
            Все записи ({entries.length})
          </summary>
          <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
            {[...entries].reverse().map((e) => (
              <li
                key={e.date}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span className="num" style={{ color: 'var(--ink-soft)' }}>{e.date}</span>
                <span className="num">{e.weight.toFixed(1)} кг</span>
                <button
                  type="button"
                  onClick={() => remove(e.date)}
                  aria-label={`Удалить запись за ${e.date}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mute)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    padding: '2px 6px',
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </WidgetFrame>
  )
}
