'use client'

import { useEffect, useState } from 'react'
import WidgetFrame from './WidgetFrame'

/**
 * Единственная Ежедневная Победа из главы «Один скучный день за раз».
 *
 * Виджет сознательно устроен беднее, чем умеет любой трекер привычек, и это
 * не упрощение, а требование текста: «В полночь счёт обнуляется. Никаких
 * накопленных очков, дневников вины, серий, которые страшно прервать».
 *
 * Поэтому здесь нет истории, календаря, процентов и счётчика дней подряд.
 * Видно только сегодня. При смене даты запись стирается сама — вчерашнее
 * не должно ни радовать, ни упрекать.
 *
 * Второй ответ называется «Пока нет», а не «Не сделал»: в главе он именно
 * такой, и это не поражение, а состояние на данный момент. Его можно
 * переключить обратно в любой момент дня.
 */

const KEY = 'guide:daily-win'

// Примеры взяты из главы: действие должно быть таким мелким,
// чтобы его было невозможно не выполнить
const EXAMPLES = [
  'Съесть порцию белка за обедом',
  'Выпить воды до кофе',
  'Пройтись десять минут',
]

type State = { date: string; action: string; done: boolean | null }

function today(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export default function DailyWin() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<State | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw) as State
        // Запись живёт один день. Дата сменилась — счёт обнулился.
        if (s?.date === today()) setState(s)
      }
    } catch {
      // повреждённая запись — начинаем день с чистого листа
    }
    setMounted(true)
  }, [])

  const persist = (s: State | null) => {
    setState(s)
    try {
      if (s) localStorage.setItem(KEY, JSON.stringify(s))
      else localStorage.removeItem(KEY)
    } catch {
      // приватный режим: отметка живёт до перезагрузки
    }
  }

  const setAction = (action: string) => {
    const a = action.trim()
    if (!a) return
    persist({ date: today(), action: a, done: null })
    setDraft('')
  }

  if (!mounted) {
    return (
      <WidgetFrame label="Победа на сегодня">
        <p className="panel-hint" style={{ margin: 0 }}>
          Загрузка…
        </p>
      </WidgetFrame>
    )
  }

  // Утро: победа ещё не выбрана
  if (!state) {
    return (
      <WidgetFrame label="Победа на сегодня">
        <p className="win-lead">
          Одно маленькое действие на сегодня — настолько мелкое, что его невозможно не выполнить.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAction(draft)
          }}
          className="win-form"
        >
          <input
            type="text"
            aria-label="Победа на сегодня"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Например: пройтись десять минут"
            maxLength={90}
            style={{ flex: 1, minWidth: 200 }}
          />
          <button type="submit" className="panel-btn" disabled={!draft.trim()}>
            Выбрать
          </button>
        </form>
        <div className="win-examples">
          {EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => setAction(e)}>
              {e}
            </button>
          ))}
        </div>
      </WidgetFrame>
    )
  }

  // Вечер: один вопрос, один ответ
  return (
    <WidgetFrame label="Победа на сегодня">
      <p className="win-action">{state.action}</p>

      <div className="win-answer">
        <button
          type="button"
          className={state.done === true ? 'win-btn is-done' : 'win-btn'}
          aria-pressed={state.done === true}
          onClick={() => persist({ ...state, done: true })}
        >
          Сделал
        </button>
        <button
          type="button"
          className={state.done === false ? 'win-btn is-pending' : 'win-btn'}
          aria-pressed={state.done === false}
          onClick={() => persist({ ...state, done: false })}
        >
          Пока нет
        </button>
      </div>

      {state.done === true && (
        <p className="win-note">
          Слово сказано и сдержано. В полночь счёт обнулится, и завтра будет новая победа.
        </p>
      )}
      {state.done === false && (
        <p className="win-note">
          День ещё не кончился. А если не выйдет — ничего не копится: завтра начнётся с нуля.
        </p>
      )}

      <button type="button" className="win-change" onClick={() => persist(null)}>
        Выбрать другое действие
      </button>
    </WidgetFrame>
  )
}
