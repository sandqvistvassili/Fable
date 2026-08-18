import { entries } from '@/lib/journal'
import { SITE, AUTHOR, SITE_URL, absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'

const FEED_SIZE = 30

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Static RSS 2.0 feed of the most recent entries, full plain text included. */
export function GET() {
  const items = entries
    .slice(0, FEED_SIZE)
    .map((entry) => {
      const url = absoluteUrl(entry.path)
      return [
        '    <item>',
        `      <title>${escapeXml(`Day ${entry.day}: ${entry.title}`)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${entry.date}T08:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(entry.summary)}</description>`,
        `      <content:encoded><![CDATA[${entry.plain.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></content:encoded>`,
        `      <category>${escapeXml(entry.topic)}</category>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <managingEditor>${escapeXml(AUTHOR.name)}</managingEditor>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
