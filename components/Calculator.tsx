'use client'

import { useEffect, useState } from 'react'
import WidgetFrame from './WidgetFrame'

// Калькулятор по формуле Миффлина — Сан Жеора. Считает три числа:
// суточный расход (TDEE), бюджет с дефицитом и норму белка на целевой вес.
// Результат хранится в localStorage браузера, чтобы не потеряться при
// дальнейшем чтении; никуда не отправляется.

const STORAGE_KEY = 'guide:calculator'

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

type Result = { tdee: number; budget: number; protein: number; floored: boolean }

// Безопасный минимум калорийности: ниже него дефицит не считается корректным
// расчётом, а становится тем самым экстремальным урезанием из главы 1.
const SAFE_FLOOR = { male: 1500, female: 1200 } as const

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

  // 15–20% дефицита, как в тексте главы: середина диапазона, но не меньше
  // 300 и не больше 500 ккал — так же, как описано словами.
  const deficit = Math.min(500, Math.max(300, tdee * 0.175))
  const floor = SAFE_FLOOR[f.sex]
  const rawBudget = tdee - deficit
  const floored = rawBudget < floor
  const budget = floored ? floor : rawBudget

  return {
    tdee: Math.round(tdee),
    budget: Math.round(budget),
    protein: Math.round(target * 1.8),
    floored,
  }
}

// Оформление полей и кнопок живёт в классах .panel* в globals.css
const fieldStyle: React.CSSProperties = {}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span>{label}</span>
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
        <button type="submit" className="panel-btn" style={{ marginTop: '18px' }}>
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
            <div key={card.label} className="panel-stat">
              <span className="v">
                {card.value}
                <small> {card.unit}</small>
              </span>
              <span className="l">{card.label}</span>
            </div>
          ))}
        </div>
      )}

      {result?.floored && (
        <p className="panel-hint" style={{ margin: '16px 0 0', color: 'var(--accent, #b45309)' }}>
          Расчётный дефицит увёл бюджет ниже безопасного минимума, поэтому здесь
          показана нижняя граница, а не честный дефицит 15–20%. При таком расходе
          снижение веса стоит обсуждать с врачом — см. главу «Прежде чем начать».
        </p>
      )}

      <p className="panel-hint" style={{ margin: '16px 0 0' }}>
        Результат сохраняется в этом браузере и никуда не отправляется.
      </p>
    </WidgetFrame>
  )
}
