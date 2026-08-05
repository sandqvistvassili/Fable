// Общая рамка для встроенных в текст инструментов: карточка на всю ширину
// колонки, отступы сверху и снизу, чтобы инструмент читался как часть главы.
export default function WidgetFrame({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={label}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        margin: '28px 0',
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontSize: '13px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--mute)',
        }}
      >
        {label}
      </p>
      {children}
    </section>
  )
}
