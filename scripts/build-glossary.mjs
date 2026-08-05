// Собирает единый глоссарий из блоков «Ключевые термины» всех статей
// плюс терминов руководства → content/glossary-index.json
//
// Запуск: node scripts/build-glossary.mjs

import fs from 'node:fs'
import path from 'node:path'

const BLOG = path.join(process.cwd(), 'content/blog')
const OUT = path.join(process.cwd(), 'content/glossary-index.json')

// ------------------------------------------------------------ нормализация

// В корпусе латиница и кириллица перемешаны в аббревиатурах: COMT написан
// то латинской O, то кириллической О. Для сличения приводим к одному виду.
// Только заглавные: аббревиатуры пишутся ими, а трогать строчные нельзя —
// иначе обычные русские слова превратятся в мешанину алфавитов.
const HOMOGLYPHS = {
  А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', Х: 'X',
}

// Свёртка применяется только внутри аббревиатур — там, где соседний символ
// тоже заглавный или цифра. Иначе «Натуральные» превращается в «Hатуральные»
// с латинской H, и слово перестаёт совпадать само с собой.
function foldHomoglyphs(s) {
  const upper = (c) => c !== undefined && (/[A-ZА-ЯЁ0-9]/.test(c))
  return s.replace(/[АВЕКМНОРСТХ]/g, (c, i) =>
    upper(s[i - 1]) || upper(s[i + 1]) ? HOMOGLYPHS[c] : c,
  )
}

// Типографские варианты одного термина: VO2max и VO₂max — одно и то же,
// но для сравнения строк это разные слова. Сюда же тире разных видов и ё/е.
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }

function foldTypography(s) {
  return s
    .replace(/[₀-₉]/g, (c) => SUB[c] ?? c)
    .replace(/[⁰¹²³⁴-⁹]/g, (c) => SUP[c] ?? c)
    .replace(/[–—−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/ё/g, 'е')
    .replace(/Ё/g, 'Е')
}

/** Ключ для сличения: без скобок, регистра и разнобоя написаний */
function normKey(name) {
  return foldTypography(foldHomoglyphs(name))
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[«»"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Ключ по мешку слов — ловит перевёрнутые аббревиатуры:
 * «ЛГ (лютеинизирующий гормон)» и «Лютеинизирующий гормон (ЛГ)».
 * Обычный ключ их не сводит, потому что после снятия скобок остаются
 * разные строки.
 */
function bagKey(name) {
  const s = foldTypography(foldHomoglyphs(name)).replace(/[()«»"'`/,.]/g, ' ')
  const words = (s.toLowerCase().match(/[\wа-я]+/g) || []).filter((w) => w.length > 1)
  return [...new Set(words)].sort().join('|')
}

/**
 * Насколько определение годится для общего словаря.
 * Длина — плюс, но выводы конкретной статьи — минус: определение
 * VO₂max, где сказано «снижен у хронических вейперов», описывает не термин,
 * а находку одного исследования.
 */
const CONTEXT_MARKERS =
  /у (хронических )?(вейпер|курильщ|бегун|пациент|диабет|подрост)|по сравнению с сопоставим|в контролируемых исследованиях|в этом исследовании/i

function definitionScore(def) {
  return def.length - (CONTEXT_MARKERS.test(def) ? 400 : 0)
}

/** Из двух написаний предпочитаем то, что начинается с кириллицы */
function preferredName(a, b) {
  const cyr = (s) => /^[А-ЯЁа-яё]/.test(s)
  if (cyr(a) !== cyr(b)) return cyr(a) ? a : b
  return a.length >= b.length ? a : b
}

// ------------------------------------------- английские названия добавок
// Читатель ищет и покупает добавки по английским названиям, поэтому
// для них показываем оба. Ключ — нормализованное русское название.

const SUPPLEMENT_EN = {
  'креатин': 'Creatine',
  'моногидрат креатина': 'Creatine monohydrate',
  'фосфокреатин': 'Phosphocreatine',
  'бета-аланин': 'Beta-alanine',
  'карнозин': 'Carnosine',
  'l-карнитин': 'L-carnitine',
  'ацетил-l-карнитин': 'Acetyl-L-carnitine',
  'ацилкарнитин': 'Acylcarnitine',
  'глутамин': 'L-glutamine',
  'глютамин': 'L-glutamine',
  'аргинин': 'L-arginine',
  'цитруллин': 'L-citrulline',
  'таурин': 'Taurine',
  'l-теанин': 'L-theanine',
  'мелатонин': 'Melatonin',
  'коэнзим q10': 'Coenzyme Q10',
  'убихинон убихинол': 'Ubiquinone / Ubiquinol',
  'гинкго билоба': 'Ginkgo biloba',
  'лютеин': 'Lutein',
  'зеаксантин': 'Zeaxanthin',
  'коллаген': 'Collagen',
  'гидролизованный коллаген': 'Hydrolysed collagen (collagen peptides)',
  'глюкозамин': 'Glucosamine',
  'хондроитин': 'Chondroitin',
  'мсм': 'MSM (methylsulfonylmethane)',
  'казеин': 'Casein',
  'сывороточный протеин': 'Whey protein',
  'сывороточный белок': 'Whey protein',
  'мальтодекстрин': 'Maltodextrin',
  'трибулус террестрис': 'Tribulus terrestris',
  'трибулус': 'Tribulus terrestris',
  'протодиосцин': 'Protodioscin',
  'родиола': 'Rhodiola rosea',
  'женьшень': 'Panax ginseng',
  'ашваганда': 'Ashwagandha (Withania somnifera)',
  'адаптоген': 'Adaptogen',
  'нутрицевтик': 'Nutraceutical',
  'термогеник': 'Thermogenic',
  'холекальциферол': 'Cholecalciferol (vitamin D3)',
  'кальцитриол': 'Calcitriol',
  'глицинат магния': 'Magnesium glycinate',
  'цитрат кальция': 'Calcium citrate',
  'карбонат кальция': 'Calcium carbonate',
  'хелатирование': 'Chelation',
  'диосмин': 'Diosmin',
  'синефрин': 'Synephrine',
  'кофеин': 'Caffeine',
  'аденозин': 'Adenosine',
  'рацетам': 'Racetam',
  'гамк': 'GABA (gamma-aminobutyric acid)',
  'мочевина': 'Urea',
  'креатинин': 'Creatinine',
}

// Сами добавки в блоках «Ключевые термины» не описаны — там разобраны
// механизмы. Поэтому заводим их отдельно: русское и английское название,
// короткое определение и ссылка на статью с разбором.
const SUPPLEMENTS = [
  ['Креатин', 'Creatine', 'Азотсодержащая кислота, повышающая запас фосфокреатина в мышцах. Самая изученная спортивная добавка: даёт прибавку в силовой работе, задерживает воду внутри мышечной клетки.', 'how-to-take-creatine-dosage-and-timing'],
  ['Бета-аланин', 'Beta-alanine', 'Аминокислота, из которой в мышцах строится карнозин — буфер против закисления. Работает на нагрузках длительностью 1–4 минуты; даёт покалывание кожи.', 'beta-alanine-how-to-take-it'],
  ['L-карнитин', 'L-carnitine', 'Переносчик жирных кислот через мембрану митохондрии. У здоровых людей запас и так полон, поэтому как жиросжигатель почти бесполезен.', 'l-carnitine-mechanism-fat-oxidation-who-it-works-for'],
  ['Ацетил-L-карнитин', 'Acetyl-L-carnitine', 'Форма карнитина, проходящая гематоэнцефалический барьер. В отличие от обычного карнитина работает в мозге, а не в мышцах.', 'acetyl-l-carnitine-vs-l-carnitine-blood-brain-barrier-acetylcholine'],
  ['BCAA', 'BCAA (branched-chain amino acids)', 'Три аминокислоты с разветвлённой цепью: лейцин, изолейцин, валин. При достаточном общем белке отдельный приём почти ничего не добавляет.', 'bcaa-mechanism-central-fatigue-when-it-works'],
  ['Глутамин', 'L-glutamine', 'Условно незаменимая аминокислота. Переоценённая добавка: реальные показания узкие, на рост мышц у здоровых людей не влияет.', 'glutamine'],
  ['Сывороточный протеин', 'Whey protein', 'Быстроусвояемый молочный белок с полным аминокислотным составом. Удобная форма добора нормы белка, но не обязательная.', 'types-of-sports-nutrition-and-protein'],
  ['Казеин', 'Casein', 'Медленный молочный белок: образует в желудке гель и отдаёт аминокислоты часами. Отсюда логика творога на ночь.', 'cottage-cheese-for-bodybuilding-and-weight-loss'],
  ['Кофеин', 'Caffeine', 'Блокатор аденозиновых рецепторов: снимает ощущение усталости и слегка поднимает расход энергии. К метаболическому эффекту привыкание за 1–3 недели.', 'nootropics-caffeine-brain-energy-adenosine-mechanism'],
  ['Мелатонин', 'Melatonin', 'Гормон, задающий сигнал темноты и сдвигающий фазу сна. Работает дозами меньше тех, что обычно продают.', 'melatonin-use'],
  ['Витамин D3', 'Vitamin D3 (cholecalciferol)', 'Строго говоря не витамин, а предшественник гормона. Дефицит распространён, особенно в северных широтах.', 'vitamin-d3-deficiency-vdr-mechanism-dosing-25ohd'],
  ['Коэнзим Q10', 'Coenzyme Q10', 'Переносчик электронов в дыхательной цепи митохондрий. Доказательная база есть, но узкая — прежде всего у принимающих статины.', 'coenzyme-q10'],
  ['Гинкго билоба', 'Ginkgo biloba', 'Растительный экстракт, влияющий на микроциркуляцию. Обещаний по памяти много, подтверждений мало.', 'ginkgo-biloba-does-it-work'],
  ['Лютеин', 'Lutein', 'Каротиноид, накапливающийся в макуле сетчатки и фильтрующий синий свет. Одна из немногих добавок с внятной пользой при экранной нагрузке.', 'lutein-eye-health-screen-fatigue-macular'],
  ['Коллаген', 'Collagen', 'Основной структурный белок кожи, связок и сухожилий. В виде гидролизата даёт пептиды, влияющие на синтез коллагена в тканях.', 'collagen-supplements-evidence-skin-joints-tendons-bioavailability'],
  ['Глюкозамин и хондроитин', 'Glucosamine & chondroitin', 'Компоненты хрящевого матрикса. Эффект при остеоартрите скромный и проявляется не у всех.', 'chondroitin-glucosamine-msm-for-joints'],
  ['Трибулус террестрис', 'Tribulus terrestris', 'Растение, продаваемое как поднимающее тестостерон. Контролируемые исследования этого не показывают.', 'tribulus-terrestris-testosterone-lh-mechanism'],
  ['ZMA', 'ZMA (zinc, magnesium, B6)', 'Цинк, магний и витамин B6 в одной капсуле. Работает как восполнение дефицита, а не как средство поднять тестостерон.', 'zma-and-tribulus-for-testosterone'],
  ['Адаптогены', 'Adaptogens', 'Родиола, женьшень, ашваганда и подобные — растения, заявленные как сглаживающие реакцию на стресс через ось ГГН.', 'adaptogens-stress-hormones-evidence'],
  ['ГАМК', 'GABA (gamma-aminobutyric acid)', 'Главный тормозной нейромедиатор. Как добавка почти не проходит гематоэнцефалический барьер, отсюда расхождение обещаний и эффекта.', 'cns-recovery-and-gaba'],
  ['Аргинин и цитруллин', 'L-arginine & L-citrulline', 'Предшественники оксида азота, дающие эффект «пампа». Цитруллин работает лучше: аргинин почти весь гибнет при первом прохождении через печень.', 'arginine-citrulline-nitric-oxide-pump-first-pass-carnitine'],
  ['Хелатные минералы', 'Chelated minerals', 'Минерал, связанный с аминокислотой для лучшего усвоения. Форма действительно определяет биодоступность кальция, магния, железа и цинка.', 'chelated-minerals-bioavailability-magnesium-calcium-iron-zinc'],
  ['Омега-3 (EPA/DHA)', 'Omega-3 (EPA/DHA)', 'Длинноцепочечные жирные кислоты из рыбьего жира. Одна из немногих добавок, нужных большинству людей на обычном рационе.', 'essential-supplements-nutraceuticals-evidence-vitamin-d-omega3-magnesium'],
  ['Жиросжигатели', 'Fat burners', 'Обычно большая доза кофеина плюс экстракты для этикетки. Прибавка к расходу — около сотни килокалорий, и та исчезает с привыканием.', 'fat-burners-review-caffeine-egcg-carnitine-evidence'],
]

// ------------------------------------------------------------------ сборка

const articles = []
for (const f of fs.readdirSync(BLOG).filter((n) => n.endsWith('.mdx'))) {
  const slug = f.replace(/\.mdx$/, '')
  const raw = fs.readFileSync(path.join(BLOG, f), 'utf8')
  const m = raw.match(/## Ключевые термины\n([\s\S]*?)(?=\n---|\n## |$)/)
  if (!m) continue
  for (const line of m[1].trim().split('\n')) {
    const mm = line.trim().match(/^-\s*\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/)
    if (!mm) continue
    articles.push({ name: mm[1].trim(), definition: mm[2].trim(), source: slug })
  }
}

// Сведение: у 142 терминов несколько определений из разных статей.
// Берём самое полное, остальные статьи запоминаем как «где ещё разобрано».
const mergedInverted = []
const byKey = new Map()
for (const t of articles) {
  const key = normKey(t.name)
  if (!key || key.length < 2) continue
  const cur = byKey.get(key)
  if (!cur) {
    byKey.set(key, { key, name: t.name, definition: t.definition, sources: [t.source] })
  } else {
    if (!cur.sources.includes(t.source)) cur.sources.push(t.source)
    if (definitionScore(t.definition) > definitionScore(cur.definition)) {
      cur.definition = t.definition
    }
    if (t.name.includes('(') && !cur.name.includes('(')) cur.name = t.name
  }
}

// Синонимы, которые автоматика не поймает: разные слова про одно и то же.
// Ключ — что сводим, значение — во что.
const SYNONYMS = {
  'ахлоргидрия гипохлоргидрия': 'ахлоргидрия',
  'сывороточный белок': 'сывороточный протеин',
}
for (const [from, to] of Object.entries(SYNONYMS)) {
  const src = byKey.get(from)
  const dst = byKey.get(to)
  if (!src || !dst) continue
  if (definitionScore(src.definition) > definitionScore(dst.definition)) {
    dst.definition = src.definition
  }
  for (const s of src.sources) if (!dst.sources.includes(s)) dst.sources.push(s)
  byKey.delete(from)
  mergedInverted.push(`${dst.name} ← ${src.name}`)
}

// Второй проход: сводим перевёрнутые аббревиатуры
const byBag = new Map()
for (const t of byKey.values()) {
  const bk = bagKey(t.name)
  const cur = byBag.get(bk)
  if (!cur) {
    byBag.set(bk, t)
    continue
  }
  cur.name = preferredName(cur.name, t.name)
  if (definitionScore(t.definition) > definitionScore(cur.definition)) {
    cur.definition = t.definition
  }
  for (const s of t.sources) if (!cur.sources.includes(s)) cur.sources.push(s)
  byKey.delete(t.key)
  mergedInverted.push(`${cur.name} ← ${t.name}`)
}

// Добавки: если термин уже пришёл из статьи — дополняем, иначе заводим новый
for (const [name, en, definition, source] of SUPPLEMENTS) {
  const key = normKey(name)
  const cur = byKey.get(key)
  if (cur) {
    cur.en = en
    if (!cur.sources.includes(source)) cur.sources.unshift(source)
  } else {
    byKey.set(key, { key, name, definition, sources: [source], en, kind: 'supplement' })
  }
}

// Термины руководства — главные метафоры книги, они уже размечены вручную
const guideTerms = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'content/guide-terms.json'), 'utf8'),
)
for (const t of guideTerms) {
  const key = normKey(t.name)
  byKey.set(key, { key, name: t.name, definition: t.definition, sources: [], en: null, kind: 'guide', id: t.id })
}

const terms = [...byKey.values()].map((t) => ({
  ...t,
  en: t.en ?? SUPPLEMENT_EN[t.key] ?? null,
  kind: t.kind ?? 'article',
}))

terms.sort((a, b) => a.name.localeCompare(b.name, 'ru'))

fs.writeFileSync(OUT, JSON.stringify({ terms }, null, 2) + '\n', 'utf8')

console.log(`сведено перевёрнутых записей: ${mergedInverted.length}`)
for (const m of mergedInverted) console.log('   ' + m)
console.log(`определений в статьях: ${articles.length}`)
console.log(`уникальных терминов после сведения: ${terms.length}`)
console.log(`терминов из нескольких статей: ${terms.filter((t) => t.sources.length > 1).length}`)
console.log(`с английским названием: ${terms.filter((t) => t.en).length}`)
