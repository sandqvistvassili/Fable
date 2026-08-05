import Link from 'next/link'
import SearchDialog from './SearchDialog'
import ReaderSettings from './ReaderSettings'

/**
 * Тонкая шапка: название слева, поиск справа. Ничего больше —
 * навигация по главам живёт в боковом оглавлении, а не наверху.
 */
export default function SiteHeader({ reading = false }: { reading?: boolean }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-mark">
          Руководство
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/blog" className="site-link">
            Статьи
          </Link>
          <Link href="/glossary" className="site-link">
            Словарь
          </Link>
          <SearchDialog />
          {reading && <ReaderSettings />}
        </div>
      </div>
    </header>
  )
}
