// Собирает индекс блога из content/blog/*.mdx в content/blog-index.json.
// Запускать после добавления или правки статей:  node scripts/build-blog-index.mjs
//
// Сами файлы статей скрипт не изменяет. Нормализация категорий и привязка
// к главам живут здесь, поэтому исходные тексты остаются нетронутыми.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const DIR = path.join(process.cwd(), 'content/blog')
const OUT = path.join(process.cwd(), 'content/blog-index.json')

// ---------------------------------------------------------------- категории

export const CATEGORIES = [
  { id: 'pohudenie', name: 'Похудение и жиросжигание' },
  { id: 'pitanie', name: 'Питание и диета' },
  { id: 'trenirovki', name: 'Тренировки' },
  { id: 'psihologiya', name: 'Психология' },
  { id: 'dobavki', name: 'Добавки' },
  { id: 'zdorovye', name: 'Здоровье и образ жизни' },
]

// Исходные категории из фронтматтера → нормализованные. «Общее» —
// свалка-фолбэк, её раскладываем по ключевым словам ниже.
const CATEGORY_MAP = {
  'Питание и диета': 'pitanie',
  Тренировки: 'trenirovki',
  'Тренировки и фитнес': 'trenirovki',
  Психология: 'psihologiya',
  'Здоровье и стиль жизни': 'zdorovye',
  'Здоровье и образ жизни': 'zdorovye',
  Добавки: 'dobavki',
  'Добавки и БАД': 'dobavki',
  'Добавки и БАДы': 'dobavki',
  Похудение: 'pohudenie',
  'Снижение веса': 'pohudenie',
  'Советы по снижению веса': 'pohudenie',
}

const CATEGORY_HINTS = {
  pohudenie: /жиросжиган|похуден|сжигани\w+ жира|дефицит калорий|сушк|лишн\w+ вес|снижени\w+ веса|жир на живот|термогеник|плато/gi,
  pitanie: /калори|белк|углевод|рацион|продукт|питани|диет|клетчатк|сахар|молок|яйц|грудк|фруктоз|гликемическ|непереносимост/gi,
  trenirovki: /тренировк|упражнени|мышц|подход|гипертроф|кардио|зал|штанг|присед|becoming|жим|тяг[аи]|восстановлени\w+ после/gi,
  psihologiya: /искажени|когнитивн|психолог|мышлени|схема-терапи|тревог|мотивац|манипул|эмоци|границ|нарцисс|защитн\w+ механизм|эвристик/gi,
  dobavki: /добавк|БАД|креатин|витамин|магни|цинк|омега|протеин|карнитин|кофеин|экстракт|порошок|дозировк/gi,
  zdorovye: /сон|здоровь|иммунитет|анализ крови|врач|болезн|давлени|холестерин|печен|почк|кожа|гормон|щитовидн/gi,
}

// Названия конкретных добавок в заголовке перевешивают всё остальное:
// статья про гинкго — про добавку, даже если внутри много слов о памяти.
const SUPPLEMENT_TITLE =
  /гинкго|креатин|карнитин|бета-?аланин|цитруллин|аргинин|глютамин|глутамин|коллаген|коэнзим|Q10|мелатонин|витамин|магни|цинк|омега|рыбий жир|ашваганд|родиол|женьшен|BCAA|ZMA|трибулус|протеин|казеин|глюкозамин|хондроитин|адаптоген|лютеин|ГАМК|хелат/i

function normalizeCategory(raw, text, title = '') {
  if (SUPPLEMENT_TITLE.test(title)) return 'dobavki'
  const direct = CATEGORY_MAP[raw]
  if (direct) return direct
  // «Общее» и всё неизвестное — по ключевым словам
  let best = 'zdorovye'
  let bestScore = 0
  for (const [id, re] of Object.entries(CATEGORY_HINTS)) {
    const n = (text.match(re) || []).length
    if (n > bestScore) {
      best = id
      bestScore = n
    }
  }
  return best
}

// ------------------------------------------------------- привязка к главам

// Слова, по которым статья считается родственной главе руководства.
// Заголовок весит больше тела: он точнее описывает, о чём статья.
const CHAPTER_KEYWORDS = {
  'chetyre-lzhi-pochemu-ne-poluchaetsya-pohudet':
    /сил[аеуы] воли|мотивац|дисциплин|эго-?истощени|истощени\w+ эго|самоконтрол/gi,
  'vsadnik-i-slon-pochemu-ya-sryvayus':
    /лимбическ|префронтальн|дофамин|импульсивн|тяга к еде|пищев\w+ зависимост|срыв\w* на еду|эмоциональн\w+ еда/gi,
  'odin-skuchnyj-den-kak-ne-brosit':
    /привычк|перфекционизм|прокрастинац|ультра-?переработ|ультра-?обработ|отклад\w+ на завтра/gi,
  'mokraya-gubka-pochemu-ves-vret':
    /задержк\w+ (воды|жидкости)|отёчн|отёк|натри|гликоген|взвешивани|весы врут|водн\w+ вес/gi,
  'matematika-skolko-kalorij-nuzhno':
    /подсчёт калорий|TDEE|норм\w+ белка|макронутриент|клетчатк|подсластител|сахарозаменител|гликемическ\w+ индекс|дефицит калорий/gi,
  'kak-szhigaetsya-zhir-kuda-on-devaetsya':
    /липолиз|адаптивн\w+ термогенез|жиросжигател|локальн\w+ жиросжиган|висцеральн|скорост\w+ похуден|термогеник/gi,
  'dvizhenie-ne-nakazanie-nuzhen-li-sport':
    /шаг\w* в день|NEAT|кардио|ходьб|HIIT|табата|пульсов\w+ зон|силов\w+ тренинг/gi,
  'pervye-30-dnej-plan-na-mesyac':
    /с чего начать|план питания|заготовк\w+ еды|режим дня|рутин|новичк/gi,
  'kogda-blizkie-tyanut-nazad-chto-delat':
    /личн\w+ границ|манипулят|социальн\w+ давлен|инвалидац|абьюз|токсичн\w+ отношени|сектант/gi,
  'ves-vstal-chto-delat-pri-plato':
    /плато|застой веса|недосып|сон и вес|кортизол|курени|растяжк|обвисш\w+ кожа|читмил|срыв/gi,
  'intervalnoe-golodanie-rabotaet-li':
    /интервальн\w+ голодани|16\/8|14\/10|фастинг|окно питания|голодани/gi,
  'ot-zhira-k-myshcam-kak-uderzhat-ves':
    /гипертроф|мышечн\w+ рост|прогрессивн\w+ перегрузк|массонабор|миоядр|набор массы|мышечн\w+ памят/gi,
}

function scoreChapters(title, description, body) {
  const head = `${title} ${description}`
  const tail = body.slice(0, 2500)
  const scores = {}
  for (const [slug, re] of Object.entries(CHAPTER_KEYWORDS)) {
    const n = (head.match(re) || []).length * 5 + (tail.match(re) || []).length
    if (n > 0) scores[slug] = n
  }
  return scores
}

// ------------------------------------------------------------------- сборка

// ------------------------------------------- отбор статей для публикации
//
// Корпус шире темы руководства: в нём есть разборы про выборы, теории
// заговора, обучение и зоопсихологию. Они хорошие, но к телу и еде
// отношения не имеют и размывают тему сайта.
//
// Каждая статья получает статус:
//   core     — прямо связана с главой руководства, публикуем и связываем
//   adjacent — та же область (еда, тренировки, добавки, поведение), публикуем
//   offtopic — за рамками темы, файл остаётся в репозитории, но не публикуется
//
// Порог можно двигать: см. README, раздел про отбор статей.

// Область руководства: тело, еда, поведение вокруг них
const ON_TOPIC =
  /вес|жир|похуден|калори|белк|углевод|еда|еды|пищ|питани|аппетит|голод|диет|тренировк|мышц|упражнени|сон|кортизол|стресс|привычк|срыв|самоконтрол|мотивац|дисциплин|границ|манипул|прокрастин|перфекционизм|метаболизм|инсулин|гормон|добавк|витамин|креатин|протеин|шаг|ходьб|кардио|тело|организм/gi

// Явно за рамками: политика, общество, познание вообще
const OFF_TOPIC =
  /выбор[аы] президент|голосовани|электорат|политическ|партии|теори\w+ заговора|religion|молитв|воспитани\w+ детей|школьн\w+ программ|скорочтени|запоминани\w+ фактов|интервальн\w+ повторени|волк|стая|шимпанзе|приматы|развод|брак|френдзон|знакомств|карьер|собеседовани|зарплат/gi

// Категории, которые целиком в теме сайта
const CORE_CATEGORIES = new Set(['pohudenie', 'pitanie', 'trenirovki', 'dobavki'])

// Ручные решения по отдельным статьям — перекрывают автоматику.
// Сюда вписывать slug'и, которые надо принудительно опубликовать или убрать.
const MANUAL_STATUS = {
  // пример: 'learned-helplessness-seligman': 'adjacent',
}

function classifyRelevance(a, text) {
  if (MANUAL_STATUS[a.slug]) return { status: MANUAL_STATUS[a.slug], on: 0, off: 0 }
  const on = (text.match(ON_TOPIC) || []).length
  const off = (text.match(OFF_TOPIC) || []).length
  if (a.chapter) return { status: 'core', on, off }
  if (off >= 3 && off * 2 > on) return { status: 'offtopic', on, off }
  if (CORE_CATEGORIES.has(a.category)) return { status: 'adjacent', on, off }
  // Психология и здоровье — только если тема действительно про тело и поведение
  return on >= 8 ? { status: 'adjacent', on, off } : { status: 'offtopic', on, off }
}

// --------------------------------------------- группы статей на одну тему
// Тексты в таких парах разные, но тема одна: в выдаче они конкурировали бы
// между собой. Обе страницы остаются, но canonical указывает на основную —
// ту, что полнее (больше слов и источников).

const STOP_LEAD = new Set(
  'что как почему когда где кто для это они она если или всё все чего чем без про над под вот так тот'.split(' '),
)

function leadTopic(title) {
  const head = title.split(/[:—–]/)[0]
  const words = (head.toLowerCase().match(/[\wа-яё]{4,}/gi) || []).filter((w) => !STOP_LEAD.has(w))
  return words.sort().slice(0, 3).join('|')
}

// Статьи, которые нельзя объединять автоматикой: заголовки похожи,
// но темы разные — это серия, а не дубли.
const NOT_DUPLICATES = new Set([
  'schema-therapy-early-maladaptive-schemas-explained',
  'schema-therapy-abandonment-instability-young-attachment',
  'schema-therapy-coping-strategies',
])

// Ручной выбор основной статьи там, где «кто длиннее» — плохой критерий.
const CANONICAL_OVERRIDES = {
  // Из пары про силу воли основная — та, где эго-истощение описано как
  // спорная гипотеза. Это совпадает с позицией главы 2 руководства.
  'discipline-vs-willpower': 'willpower-how-to-develop-willpower',
}

function assignCanonical(list) {
  const groups = {}
  for (const a of list) {
    if (NOT_DUPLICATES.has(a.slug)) continue
    const key = leadTopic(a.title)
    if (!key) continue
    ;(groups[key] ||= []).push(a)
  }
  for (const members of Object.values(groups)) {
    if (members.length < 2) continue
    let main = [...members].sort((a, b) => b.words - a.words || b.refs - a.refs)[0]
    for (const m of members) {
      const forced = CANONICAL_OVERRIDES[m.slug]
      if (forced) main = members.find((x) => x.slug === forced) || main
    }
    for (const m of members) {
      m.duplicateGroup = members.map((x) => x.slug).sort()
      m.canonicalSlug = main.slug
    }
  }
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
const articles = files.map((f) => {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8')
  const { data, content } = matter(raw)
  const slug = f.replace(/\.mdx$/, '')
  const title = String(data.title || slug).trim()
  const description = String(data.description || '').trim()
  const scores = scoreChapters(title, description, content)
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return {
    slug,
    title,
    description,
    sourceCategory: data.category || null,
    category: normalizeCategory(data.category, `${title} ${description} ${content.slice(0, 2500)}`, title),
    // Главная глава для блока «Читать по теме» в конце статьи.
    // Порог 5 = минимум одно совпадение в заголовке или описании.
    chapter: top && top[1] >= 5 ? top[0] : null,
    chapterScores: scores,
    words: content.split(/\s+/).length,
    refs: (content.match(/^\d+\. /gm) || []).length,
    canonicalSlug: null,
    duplicateGroup: null,
    status: 'adjacent',
    onTopicHits: 0,
    offTopicHits: 0,
  }
})

for (const a of articles) {
  const src = fs.readFileSync(path.join(DIR, `${a.slug}.mdx`), 'utf8')
  const r = classifyRelevance(a, `${a.title} ${a.description} ${src.slice(0, 3000)}`)
  a.status = r.status
  a.onTopicHits = r.on
  a.offTopicHits = r.off
}

assignCanonical(articles)
// Дат у статей нет — они вневременные, поэтому порядок алфавитный
articles.sort((a, b) => a.title.localeCompare(b.title, 'ru'))

fs.writeFileSync(
  OUT,
  JSON.stringify({ categories: CATEGORIES, articles }, null, 2) + '\n',
  'utf8',
)

const byCat = {}
const byChapter = {}
for (const a of articles) {
  byCat[a.category] = (byCat[a.category] || 0) + 1
  if (a.chapter) byChapter[a.chapter] = (byChapter[a.chapter] || 0) + 1
}
const byStatus = {}
for (const a of articles) byStatus[a.status] = (byStatus[a.status] || 0) + 1
console.log('по статусу отбора:', byStatus)

const dupGroups = new Set(articles.filter((a) => a.duplicateGroup).map((a) => a.canonicalSlug))
console.log(`статей: ${articles.length}`)
console.log('по категориям:', byCat)
console.log('привязано к главам:', byChapter)
console.log('без привязки:', articles.filter((a) => !a.chapter).length)
console.log(
  `групп на одну тему: ${dupGroups.size}, в них статей: ${articles.filter((a) => a.duplicateGroup).length}`,
)
