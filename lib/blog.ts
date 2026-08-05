import index from '@/content/blog-index.json'
import { chapters, type Chapter } from './chapters'

export type Article = {
  slug: string
  title: string
  description: string
  sourceCategory: string | null
  category: string
  /** Slug главы руководства, к которой статья ближе всего, либо null */
  chapter: string | null
  chapterScores: Record<string, number>
  words: number
  refs: number
  /** Если статья входит в группу на одну тему — slug основной статьи группы */
  canonicalSlug: string | null
  duplicateGroup: string[] | null
  /**
   * core     — прямо связана с главой руководства
   * adjacent — та же область, публикуем без привязки к главе
   * offtopic — за рамками темы сайта: файл в репозитории есть, но страницы нет
   */
  status: 'core' | 'adjacent' | 'offtopic'
  onTopicHits: number
  offTopicHits: number
}

export type Category = { id: string; name: string }

export const categories: Category[] = index.categories

/** Все статьи корпуса, включая неопубликованные */
export const allArticles: Article[] = index.articles as Article[]

/** Опубликованные — те, что по теме сайта */
export const articles: Article[] = allArticles.filter((a) => a.status !== 'offtopic')

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export function articlesByCategory(id: string): Article[] {
  return articles.filter((a) => a.category === id)
}

export function categoryCounts(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of articles) out[a.category] = (out[a.category] || 0) + 1
  return out
}

/** Статьи, относящиеся к главе руководства — для блока «Глубже по теме» */
export function articlesForChapter(chapterSlug: string, limit = 6): Article[] {
  return articles
    .filter((a) => a.chapterScores[chapterSlug])
    // Основную статью группы показываем, дубликаты — нет
    .filter((a) => !a.canonicalSlug || a.canonicalSlug === a.slug)
    .sort((a, b) => b.chapterScores[chapterSlug] - a.chapterScores[chapterSlug])
    .slice(0, limit)
}

/** Глава руководства, к которой ведём читателя из статьи */
export function chapterForArticle(a: Article): Chapter | undefined {
  return a.chapter ? chapters.find((c) => c.slug === a.chapter) : undefined
}

/** Соседние статьи той же категории — простая перелинковка */
export function relatedArticles(a: Article, limit = 4): Article[] {
  const sameChapter = a.chapter
    ? articles.filter((x) => x.slug !== a.slug && x.chapter === a.chapter)
    : []
  const sameCategory = articles.filter(
    (x) => x.slug !== a.slug && x.category === a.category && !sameChapter.includes(x),
  )
  return [...sameChapter, ...sameCategory].slice(0, limit)
}
