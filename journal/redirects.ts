/**
 * URL freeze protection.
 *
 * Entry URLs are permanent from the day they are published. If a URL ever has
 * to change (a renamed slug, a restructure), the old address goes here and the
 * deploy platform serves a 301. Never delete a published URL silently.
 *
 * Vercel: `vercel.json` is generated from this file by `scripts/build-redirects.mjs`
 * (run it after editing). Cloudflare Pages: the same script emits `public/_redirects`.
 */

export type Redirect = { from: string; to: string }

export const redirects: Redirect[] = [
  // { from: '/journal/old-slug', to: '/journal/day-12-new-slug' },
]
