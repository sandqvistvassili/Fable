'use client'

import { useEffect, useState } from 'react'

/**
 * Полоса прогресса чтения плюс процент.
 * Полоса — волосяная, процент показывается только когда чтение началось:
 * «0%» в момент открытия главы ничего не сообщает и лишь отвлекает.
 */
export default function ReadingProgress({ onChange }: { onChange?: (p: number) => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      const p = total > 8 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0
      setProgress(p)
      onChange?.(p)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [onChange])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'var(--accent)',
          opacity: progress > 0.005 ? 0.85 : 0,
          transition: 'opacity 0.3s var(--ease)',
        }}
      />
    </div>
  )
}
