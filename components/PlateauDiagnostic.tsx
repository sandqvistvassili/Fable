'use client'

import { useEffect, useState } from 'react'
import WidgetFrame from './WidgetFrame'

/**
 * Пошаговая диагностика плато из главы «Вес встал».
 *
 * Глава задаёт дерево решений дословно: сначала проверка, плато ли это
 * (среднее стоит 14 дней + талия не ушла + режим был чистым), затем три
 * шага по одному за раз. Виджет ведёт читателя ровно по этой логике.
 *
 * Диагностика идёт неделями, поэтому позиция запоминается: вернувшись через
 * неделю, читатель продолжает с того же места. Ни серий, ни очков, ни
 * красного за «вес не сдвинулся» — это не провал, а нормальный ход проверки.
 */

const KEY = 'guide:plateau'

type Phase =
  | 'gate'
  | 'not-plateau-water'
  | 'not-plateau-data'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'resolved'
  | 'lever-cals'
  | 'lever-steps'

type Gate = { avgFlat: boolean | null; waist: boolean | null; clean: boolean | null }

const EMPTY_GATE: Gate = { avgFlat: null, waist: null, clean: null }

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className="plateau-yesno">
      <button
        type="button"
        aria-pressed={value === true}
        className={value === true ? 'is-on' : ''}
        onClick={() => onChange(true)}
      >
        Да
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        className={value === false ? 'is-on' : ''}
        onClick={() => onChange(false)}
      >
        Нет
      </button>
    </div>
  )
}

export default function PlateauDiagnostic() {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<Phase>('gate')
  const [gate, setGate] = useState<Gate>(EMPTY_GATE)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.phase) setPhase(s.phase)
        if (s.gate) setGate({ ...EMPTY_GATE, ...s.gate })
      }
    } catch {
      // повреждённое состояние — начинаем заново
    }
    setMounted(true)
  }, [])

  const save = (next: { phase: Phase; gate: Gate }) => {
    setPhase(next.phase)
    setGate(next.gate)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // приватный режим — состояние живёт до перезагрузки
    }
  }

  const reset = () => save({ phase: 'gate', gate: EMPTY_GATE })

  // Проверка «плато ли это». Настоящее плато — среднее стоит 14 дней И талия
  // не ушла. Если при этом режим был с грешками — это погрешность данных.
  const evaluateGate = (g: Gate) => {
    if (g.avgFlat === null || g.waist === null || g.clean === null) return
    if (!g.avgFlat || !g.waist) {
      save({ phase: 'not-plateau-water', gate: g })
    } else if (!g.clean) {
      save({ phase: 'not-plateau-data', gate: g })
    } else {
      save({ phase: 'step1', gate: g })
    }
  }

  const setGateField = (field: keyof Gate, v: boolean) => {
    const g = { ...gate, [field]: v }
    setGate(g)
    // Даём дочитать все три ответа, а решение принимаем, когда заполнены все
    if (g.avgFlat !== null && g.waist !== null && g.clean !== null) evaluateGate(g)
  }

  if (!mounted) {
    return (
      <WidgetFrame label="Диагностика плато">
        <p className="panel-hint" style={{ margin: 0 }}>
          Загрузка…
        </p>
      </WidgetFrame>
    )
  }

  return (
    <WidgetFrame label="Диагностика плато">
      {phase === 'gate' && (
        <div className="plateau-gate">
          <p className="plateau-lead">Сначала убедимся, что это действительно плато.</p>

          <div className="plateau-q">
            <span>Недельное среднее стоит на месте четырнадцать дней подряд?</span>
            <YesNo value={gate.avgFlat} onChange={(v) => setGateField('avgFlat', v)} />
          </div>
          <div className="plateau-q">
            <span>Объём талии за это время не уменьшился ни на сантиметр?</span>
            <YesNo value={gate.waist} onChange={(v) => setGateField('waist', v)} />
          </div>
          <div className="plateau-q">
            <span>
              Две недели режим был идеальным — трёхчасовой ритм, всё по весам, без поблажек на
              выходных?
            </span>
            <YesNo value={gate.clean} onChange={(v) => setGateField('clean', v)} />
          </div>
        </div>
      )}

      {phase === 'not-plateau-water' && (
        <Outcome
          title="Пока это не плато"
          onReset={reset}
          body="Резкий скачок веса после солёного ужина или тяжёлой тренировки — это Мокрая губка, а не остановка сжигания жира. Настоящий застой виден только по недельному среднему за четырнадцать дней. Продолжай в прежнем режиме и сравни средние, а не отдельные утра."
        />
      )}

      {phase === 'not-plateau-data' && (
        <Outcome
          title="Дело не в физиологии"
          onReset={reset}
          body="Если на выходных были мелкие поблажки, ритм сбивался, а масло лилось на глаз — вес стоит из-за погрешности данных, а не из-за плато. Люди систематически занижают съеденное на двадцать-сорок процентов. Верни дисциплину первого месяца на неделю, и большинство мнимых застоев разбивается здесь."
        />
      )}

      {phase === 'step1' && (
        <Step
          n={1}
          title="Неделя точности"
          instruction="Цель по калориям не трогай. Просто вернись к дисциплине первого месяца: взвешивай всё, включая масло и соусы, закрывай норму белка и воды. Держи неделю и сравни недельное среднее."
          downLabel="Среднее поползло вниз"
          onDown={() => save({ phase: 'resolved', gate })}
          stayLabel="Вес всё ещё стоит"
          onStay={() => save({ phase: 'step2', gate })}
          onReset={reset}
        />
      )}

      {phase === 'step2' && (
        <Step
          n={2}
          title="Неделя сна"
          instruction="Математика чистая — значит, процесс тормозят гормоны. Семь-восемь часов сна, никаких экранов за полчаса до отбоя, никакого кофеина после двух дня. Держи неделю."
          downLabel="Среднее поползло вниз"
          onDown={() => save({ phase: 'resolved', gate })}
          stayLabel="Вес всё ещё стоит"
          onStay={() => save({ phase: 'step3', gate })}
          onReset={reset}
        />
      )}

      {phase === 'step3' && (
        <div>
          <p className="plateau-step-eyebrow">
            Шаг <span className="num">3</span> · Один рычаг
          </p>
          <p className="plateau-lead">
            Математика идеальна, сон глубокий — значит, ты стал меньше, и телу нужен новый расчёт
            топлива. Выбери <strong>один</strong> вариант, не оба сразу.
          </p>
          <div className="plateau-levers">
            <button type="button" className="plateau-lever" onClick={() => save({ phase: 'lever-cals', gate })}>
              <span className="plateau-lever-title">Убрать 150–200 ккал</span>
              <span className="plateau-lever-sub">
                из углеводов или жиров — половина горсти риса или ложка масла. Белок не трогаешь.
              </span>
            </button>
            <button type="button" className="plateau-lever" onClick={() => save({ phase: 'lever-steps', gate })}>
              <span className="plateau-lever-title">Добавить 1500–2000 шагов</span>
              <span className="plateau-lever-sub">
                к ежедневной норме — примерно пятнадцать минут бодрой ходьбы.
              </span>
            </button>
          </div>
          <button type="button" className="plateau-reset" onClick={reset}>
            Начать проверку заново
          </button>
        </div>
      )}

      {(phase === 'lever-cals' || phase === 'lever-steps') && (
        <Outcome
          title={phase === 'lever-cals' ? 'Рычаг выбран: минус 150–200 ккал' : 'Рычаг выбран: плюс 1500–2000 шагов'}
          onReset={reset}
          body="Наблюдай за недельным средним ещё две недели — по одной этой переменной. Если среднее пошло вниз, ты нашёл рычаг. Если нет, вернись сюда и попробуй второй. Меняем строго по одному, иначе непонятно, что сработало."
        />
      )}

      {phase === 'resolved' && (
        <Outcome
          title="Диагностика завершена"
          onReset={reset}
          body="Среднее снова двигается — значит, застой был мнимым и разбился о точность. Держи режим и сравнивай недельные средние, а не отдельные утра."
        />
      )}
    </WidgetFrame>
  )
}

function Step({
  n,
  title,
  instruction,
  downLabel,
  onDown,
  stayLabel,
  onStay,
  onReset,
}: {
  n: number
  title: string
  instruction: string
  downLabel: string
  onDown: () => void
  stayLabel: string
  onStay: () => void
  onReset: () => void
}) {
  return (
    <div>
      <p className="plateau-step-eyebrow">
        Шаг <span className="num">{n}</span> · {title}
      </p>
      <p className="plateau-lead">{instruction}</p>
      <div className="plateau-actions">
        <button type="button" className="panel-btn" onClick={onDown}>
          {downLabel}
        </button>
        <button type="button" className="plateau-secondary" onClick={onStay}>
          {stayLabel}
        </button>
      </div>
      <button type="button" className="plateau-reset" onClick={onReset}>
        Начать проверку заново
      </button>
    </div>
  )
}

function Outcome({
  title,
  body,
  onReset,
}: {
  title: string
  body: string
  onReset: () => void
}) {
  return (
    <div>
      <p className="plateau-outcome-title">{title}</p>
      <p className="plateau-lead" style={{ marginBottom: 18 }}>
        {body}
      </p>
      <button type="button" className="plateau-reset" onClick={onReset}>
        Начать проверку заново
      </button>
    </div>
  )
}
