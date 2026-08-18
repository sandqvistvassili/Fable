import Link from 'next/link'

export default function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag}`}
            className="inline-block rounded-[2px] border border-rule px-2 py-0.5 font-mach text-micro tracking-[0.08em] text-ink-soft no-underline hover:border-accent hover:text-accent"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
