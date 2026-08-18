# vassilisandqvist.com — a daily learning journal

A public journal of learning to code: one short entry a day, written in English,
published on my own domain first and distributed to LinkedIn and X as copies.
Static site, plain MDX files, no database, no accounts, nothing to hack.

**Design: "The Ledger".** Monospace for everything the machine knows (day
numbers, dates, topics, counters), serif for everything the human wrote (titles,
text). One accent colour — iron red — used in exactly four places. Light and
dark follow the system preference.

## The daily ritual (~15 minutes)

```bash
npm run new                 # scaffolds today's entry: day number, date, template
# … write 150–300 words, fill in the one-sentence summary …
npm run check               # validation + typecheck + full build; fails loudly
git add -A && git commit -m "Day N: what happened" && git push   # auto-deploys
```

Then open the entry's `/share` page on the live site and copy the LinkedIn post,
the first comment, and the X thread. Done.

Prefer a form to a text editor? `npm run dev`, then open
`http://localhost:3000/admin` — a local writing desk with live preview and
character counters. It writes the same MDX file; it does not exist in
production builds at all.

## Commands

| Command | What it does |
|---|---|
| `npm run new` | Create today's entry (`--topic python`, `--article`, `--draft`) |
| `npm run check` | Validate content, typecheck, production build — the pre-push gate |
| `npm run stats` | Streak, word counts, topic split in the terminal |
| `npm run dev` | Dev server with the local admin at `/admin` |
| `npm run build` | Validate → index → build → OG images (what CI and the host run) |
| `npm test` | Unit tests for the content pipeline |
| `npm run validate` | Just the content validation |

## How publishing works

Every entry is an MDX file in `content/journal/` with validated frontmatter.
The author decides four things: **title, summary, topic, tags**. Everything
else — URL, day number, meta description, canonical link, Open Graph image,
JSON-LD, sitemap, RSS, share texts, counters — is derived at build time.
The build **fails** on a missing field, an over-long title, a duplicate or
gapped day number. That is the whole SEO strategy: bad metadata cannot ship.

```
content/journal/0008-what-finally-made-list-comprehensions-click.mdx
└─ /journal/day-8-what-finally-made-list-comprehensions-click   (canonical URL)
   /journal/day-8-…/share                                       (LinkedIn + X copy desk)
   /og/day-8-….png                                              (generated share card)
```

Topics are a closed list (`python`, `swedish`, `english`, `security`, `life`) —
defined once in `site.config.json`, enforced by the schema. Topic hubs and tag
pages with fewer than 5 entries are `noindex` until they have substance, so the
site never accumulates thin pages.

## Layout

```
site.config.json      identity, topics, limits — the single source of truth
content/journal/      the entries (NNNN-slug.mdx)
content/topics/       optional hand-written hub intros (<topic>.mdx)
content/weeks/        optional weekly wrap-ups (<n>.mdx)
content/pages/        about.mdx, now.mdx
lib/                  typed index access, share generators, formatting, JSON-LD
scripts/              validate, build-index, build-og, new-entry, stats
app/                  routes; *.dev.tsx exists only under `next dev`
tests/                content pipeline unit tests
```

## Deploying

Any static host. Point it at `journal/` with build command `npm run build` and
output directory `out/`.

- **Cloudflare Pages / Netlify** — security headers ship via `public/_headers`.
- **Vercel** — redirects ship via `vercel.json`; mirror `_headers` there when
  adding headers.

Set the production domain once in `site.config.json` → `siteUrl`; canonical
URLs, sitemap, robots, RSS and share links all follow.

**Changing a published URL:** add a rule to `redirects.ts`, run
`node scripts/build-redirects.mjs`, commit both generated files. Published URLs
are otherwise frozen forever.
