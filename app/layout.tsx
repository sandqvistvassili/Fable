import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './globals.css'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ru_RU',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/*
          Настройки чтения применяются до первой отрисовки: иначе текст,
          набранный крупно, на мгновение показался бы обычным и прыгнул.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('guide:reader')||'{}');
var sc={s:0.94,m:1,l:1.1}[s.size];var w={narrow:620,normal:720,wide:800}[s.width];
if(sc)document.documentElement.style.setProperty('--reader-scale',sc);
if(w)document.documentElement.style.setProperty('--measure',w+'px');}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
