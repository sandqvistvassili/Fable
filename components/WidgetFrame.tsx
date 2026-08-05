// Инструменты внутри текста оформлены тёмной панелью: читатель видит,
// что перешёл от чтения к работе с прибором, и так же видит, где вернулся
// обратно к тексту. Этот контраст — основа всего оформления.
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
      className="panel"
      style={{ margin: '32px 0', padding: '24px' }}
    >
      <p className="panel-label">{label}</p>
      {children}
    </section>
  )
}
