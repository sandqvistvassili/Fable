import config from '@/site.config.json'

/**
 * Identity and limits for the whole site, read from `site.config.json`.
 * That file is the single source of truth — the build scripts read the same
 * JSON, so the app and the tooling can never drift apart.
 */

export const SITE_URL = config.siteUrl
export const AUTHOR = config.author
export const SITE = config.site
export const START_DATE = config.startDate
export const LOCALE = config.locale
export const LIMITS = config.limits

export type TopicKey = keyof typeof config.topics

export type TopicMeta = {
  label: string
  blurb: string
  primary: boolean
}

export const TOPICS = config.topics as Record<TopicKey, TopicMeta>

export const TOPIC_KEYS = Object.keys(TOPICS) as TopicKey[]

/** Topics that lead the navigation. The rest still have hubs, just less prominence. */
export const PRIMARY_TOPIC_KEYS = TOPIC_KEYS.filter((k) => TOPICS[k].primary)

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

export function isTopicKey(value: string): value is TopicKey {
  return Object.prototype.hasOwnProperty.call(TOPICS, value)
}
