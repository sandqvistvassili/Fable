import { serializeJsonLd } from '@/lib/jsonld'

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Serialised from validated frontmatter only; `<` is escaped inside.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
