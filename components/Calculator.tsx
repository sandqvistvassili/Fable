'use client'

import { useEffect, useState } from 'react'
import WidgetFrame from './WidgetFrame'

// Калькулятор по формуле Миффлина — Сан Жеора. Считает три числа:
// суточный расход (TDEE), бюджет с дефицитом и норму белка на целевой вес.
// Результат хранится в localStorage браузера, чтобы не потеряться при
// дальнейшем чтении; никуда не отправляется.

const STORAGE_KEY = 'kniga:calculator'

const ACTIVITY = [
  { value: '1.2', label: 'Малоподвижный' },
  { value: '1.375', label: 'Лёгкая активность' },
  { value: '1.55', label: 'Средняя активность' },
  { value: '1.725', label: 'Высокая активность' },
] as const

type FormState = {
  sex: 'male' | 'female'
  age: string
  height: string
  weight: string
  targetWeight: string
  activity: string
}

const EMPTY: FormState = {
  sex: 'male',
  age: '',
  height: '',
  weight: '',
  targetWeight: '',
  activity: '1.375',
}

type Result = { tdee: number; budget: number; protein: number }

function compute(f: FormState): Result | null {
  const age = Number(f.age)
  const height = Number(f.height)
  const weight = Number(f.weight)
  const target = Number(f.targetWeight)
  if (!age || !height || !weight || !target) return null
  if (age < 14 || age > 100 || height < 120 || height > 230) return null
  if (weight < 35 || weight > 300 || target < 35 || target > 300) return null

  const bmr =
    10 * weight + 6.25 * height - 5 * age + (f.sex === 'male' ? 5 : -161)
  const tdee = bmr * Number(f.activity)
  return {
    tdee: Math.round(tdee),
    budget: Math.round(tdee - 400),
    protein: Math.round(target * 1.8),
  }
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontSize: '16px',
  fontFamily: 'var(--font-text)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  color: 'var(--ink-soft)',
  marginBottom: '6px',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

export default function Calculator() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { form: FormState; result: Result }
        if (saved.form) setForm({ ...EMPTY, ...saved.form })
        if (saved.result) setResult(saved.result)
      }
    } catch {
      // повреждённые данные игнорируем
    }
  }, [])

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = compute(form)
    setResult(r)
    if (r) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, result: r }))
      } catch {
        // localStorage недоступен — просто показываем результат
      }
    }
  }

  return (
    <WidgetFrame label="Калькулятор: твои три числа">
      <form onSubmit={onSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
          }}
        >
          <Field label="Пол">
            <select value={form.sex} onChange={set('sex')} style={fieldStyle}>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </Field>
          <Field label="Возраст, лет">
            <input
              type="number"
              inputMode="numeric"
              min={14}
              max={100}
              value={form.age}
              onChange={set('age')}
              style={fieldStyle}
              required
            />
          </Field>
          <Field label="Рост, см">
            <input
              type="number"
              inputMode="numeric"
              min={120}
              max={230}
              value={form.height}
              onChange={set('height')}
              style={fieldStyle}
              required
            />
          </Field>
          <Field label="Текущий вес, кг">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={35}
              max={300}
              value={form.weight}
              onChange={set('weight')}
              style={fieldStyle}
              required
            />
          </Field>
          <Field label="Целевой вес, кг">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={35}
              max={300}
              value={form.targetWeight}
              onChange={set('targetWeight')}
              style={fieldStyle}
              required
            />
          </Field>
          <Field label="Активность">
            <select value={form.activity} onChange={set('activity')} style={fieldStyle}>
              {ACTIVITY.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          type="submit"
          style={{
            marginTop: '16px',
            padding: '11px 24px',
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '16px',
            fontFamily: 'var(--font-text)',
            cursor: 'pointer',
          }}
        >
          Посчитать
        </button>
      </form>

      {result && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '18px',
          }}
        >
          {[
            { value: result.tdee, unit: 'ккал', label: 'Расход в день (TDEE)' },
            { value: result.budget, unit: 'ккал', label: 'Бюджет с дефицитом' },
            { value: result.protein, unit: 'г', label: 'Белок в день' },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
              }}
            >
              <span className="num" style={{ display: 'block', fontSize: '26px', fontWeight: 500 }}>
                {card.value}
                <span style={{ fontSize: '15px', color: 'var(--mute)' }}> {card.unit}</span>
              </span>
              <span style={{ display: 'block', fontSize: '14px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
        Результат сохраняется в этом браузере и никуда не отправляется.
      </p>
    </WidgetFrame>
  )
}
