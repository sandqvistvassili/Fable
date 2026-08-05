'use client'

// Общий SVG-график для демо и живого трекера: бледные точки — отдельные
// взвешивания (шум), сплошная линия --blue — недельное среднее (тренд).
export type ChartPoint = { t: number; w: number }

export default function WeightChart({
  points,
  line,
  ariaLabel,
}: {
  points: ChartPoint[]
  line: ChartPoint[]
  ariaLabel: string
}) {
  const W = 600
  const H = 220
  const PAD = { top: 14, right: 14, bottom: 14, left: 46 }

  const all = [...points, ...line]
  if (all.length === 0) return null

  const tMin = Math.min(...all.map((p) => p.t))
  const tMax = Math.max(...all.map((p) => p.t))
  const wMin = Math.min(...all.map((p) => p.w))
  const wMax = Math.max(...all.map((p) => p.w))
  const wPad = Math.max(0.4, (wMax - wMin) * 0.15)
  const y0 = wMin - wPad
  const y1 = wMax + wPad
  const tSpan = tMax - tMin || 1

  const x = (t: number) => PAD.left + ((t - tMin) / tSpan) * (W - PAD.left - PAD.right)
  const y = (w: number) => PAD.top + (1 - (w - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom)

  const path = line.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.w).toFixed(1)}`).join(' ')

  const gridVals = [y0 + (y1 - y0) * 0.2, y0 + (y1 - y0) * 0.5, y0 + (y1 - y0) * 0.8]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {gridVals.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--line)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill="var(--mute)"
            fontFamily="var(--font-mono)"
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={x(p.t)} cy={y(p.w)} r={3.5} fill="var(--mute)" opacity={0.45} />
      ))}
      {line.length > 1 && (
        <path d={path} fill="none" stroke="var(--blue)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {line.map((p, i) => (
        <circle key={`a${i}`} cx={x(p.t)} cy={y(p.w)} r={4} fill="var(--blue)" />
      ))}
    </svg>
  )
}
