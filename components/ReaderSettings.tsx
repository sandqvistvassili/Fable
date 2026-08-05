'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Режим чтения как в читалке: размер текста и ширина колонки.
 * Тем оформления здесь нет намеренно — фон книги один и подобран,
 * а переключение на «ночь» превратило бы издание в приложение.
 *
 * Выбор запоминается в localStorage и применяется до первой отрисовки
 * скриптом в <head>, иначе текст на мгновение прыгал бы.
 */

const SIZES = [
  { id: 's', label: 'Aa', title: 'Мельче', scale: 0.94 },
  { id: 'm', label: 'Aa', title: 'Обычный', scale: 1 },
  { id: 'l', label: 'Aa', title: 'Крупнее', scale: 1.1 },
] as const

const WIDTHS = [
  { id: 'narrow', label: 'Узкая', px: 620 },
  { id: 'normal', label: 'Обычная', px: 720 },
  { id: 'wide', label: 'Широкая', px: 800 },
] as const

const KEY = 'guide:reader'

export default function ReaderSettings() {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<string>('m')
  const [width, setWidth] = useState<string>('normal')
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.size) setSize(s.size)
        if (s.width) setWidth(s.width)
      }
    } catch {
      // повреждённая настройка — читаем со значениями по умолчанию
    }
  }, [])

  useEffect(() => {
    const scale = SIZES.find((s) => s.id === size)?.scale ?? 1
    const px = WIDTHS.find((w) => w.id === width)?.px ?? 720
    document.documentElement.style.setProperty('--reader-scale', String(scale))
    document.documentElement.style.setProperty('--measure', `${px}px`)
    try {
      localStorage.setItem(KEY, JSON.stringify({ size, width }))
    } catch {
      // приватный режим: настройка действует до перезагрузки
    }
  }, [size, width])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="reader-settings" ref={box}>
      <button
        type="button"
        className="reader-settings-trigger"
        aria-expanded={open}
        aria-label="Настройки чтения"
        onClick={() => setOpen((v) => !v)}
      >
        Aa
      </button>

      {open && (
        <div className="reader-settings-popover" role="group" aria-label="Настройки чтения">
          <div className="reader-settings-row">
            <span className="reader-settings-label">Размер текста</span>
            <div className="reader-seg">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.title}
                  aria-pressed={size === s.id}
                  onClick={() => setSize(s.id)}
                  style={{ fontSize: `${11 * s.scale + 2}px` }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="reader-settings-row">
            <span className="reader-settings-label">Ширина колонки</span>
            <div className="reader-seg">
              {WIDTHS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={width === w.id}
                  onClick={() => setWidth(w.id)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
