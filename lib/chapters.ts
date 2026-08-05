export type Chapter = {
  /** Порядковый номер, 1–13 */
  order: number
  /** URL: /guide/[slug] */
  slug: string
  /** Имя MDX-файла в content/chapters без расширения */
  file: string
  /** H1 главы — как в исходном тексте */
  title: string
  /** Meta title под поисковые запросы (из SEO-файла) */
  seoTitle: string
  /** Meta description, 150–160 символов */
  description: string
}

export const chapters: Chapter[] = [
  {
    order: 1,
    slug: 'prezhde-chem-nachat-komu-ne-podojdet',
    file: '01-prezhde-chem-nachat',
    title: 'Прежде чем начать',
    seoTitle: 'Прежде чем начать худеть: противопоказания и границы метода',
    description:
      'Когда снижение веса нужно обсуждать с врачом: хронические болезни, беременность, расстройства пищевого поведения. Честные границы применимости методики.',
  },
  {
    order: 2,
    slug: 'chetyre-lzhi-pochemu-ne-poluchaetsya-pohudet',
    file: '02-chetyre-lzhi',
    title: 'Четыре лжи, которые держат тебя в ловушке',
    seoTitle: 'Почему не получается похудеть на силе воли — 4 причины',
    description:
      'Сила воли, мотивация, «лёгкая стройность» — разбираем главные заблуждения о похудении с научными источниками. Понятно, без диет и списков продуктов.',
  },
  {
    order: 3,
    slug: 'vsadnik-i-slon-pochemu-ya-sryvayus',
    file: '03-vsadnik-i-slon',
    title: 'Всадник и Слон',
    seoTitle: 'Почему я срываюсь на еду, даже когда обещаю себе не есть',
    description:
      'Психология срывов на диете: почему обещания себе не работают и как перестать бороться с собственным мозгом, а не с едой.',
  },
  {
    order: 4,
    slug: 'odin-skuchnyj-den-kak-ne-brosit',
    file: '04-odin-skuchnyj-den',
    title: 'Один скучный день за раз',
    seoTitle: 'Как не бросить диету через неделю — метод одного дня',
    description:
      'Почему план «изменить жизнь навсегда» проваливается, и что делать вместо него, чтобы держаться месяцами, а не днями.',
  },
  {
    order: 5,
    slug: 'mokraya-gubka-pochemu-ves-vret',
    file: '05-mokraya-gubka',
    title: 'Мокрая губка: почему весы врут',
    seoTitle: 'Почему вес скачет туда-сюда каждый день — это не жир',
    description:
      'Вода, соль, гликоген и стресс могут добавить на весах до 2 кг за ночь. Разбираем, почему ежедневное взвешивание вводит в заблуждение.',
  },
  {
    order: 6,
    slug: 'matematika-skolko-kalorij-nuzhno',
    file: '06-matematika',
    title: 'Математика: белки, углеводы и жиры',
    seoTitle: 'Сколько калорий нужно, чтобы похудеть — расчёт по формуле',
    description:
      'Как посчитать свою норму калорий и белка для похудения. Калькулятор и объяснение, почему точные цифры работают лучше диет.',
  },
  {
    order: 7,
    slug: 'kak-szhigaetsya-zhir-kuda-on-devaetsya',
    file: '07-kak-szhigaetsya-zhir',
    title: 'Как на самом деле сжигается жир',
    seoTitle: 'Куда девается жир, когда худеешь — объяснение физиологии',
    description:
      'Жир не «сгорает» и не превращается в мышцы. Простое объяснение, как организм физически избавляется от жировых запасов.',
  },
  {
    order: 8,
    slug: 'dvizhenie-ne-nakazanie-nuzhen-li-sport',
    file: '08-dvizhenie-ne-nakazanie',
    title: 'Движение — не наказание',
    seoTitle: 'Нужно ли заниматься спортом, чтобы похудеть',
    description:
      'Можно ли похудеть без тренировок и зачем на самом деле нужно движение при похудении, если не для сжигания калорий.',
  },
  {
    order: 9,
    slug: 'pervye-30-dnej-plan-na-mesyac',
    file: '09-pervye-30-dnej',
    title: 'Первые 30 дней',
    seoTitle: 'С чего начать похудение — план на первый месяц',
    description:
      'Пошаговый план на первые 30 дней похудения: три простых правила вместо сложных диет и списков запрещённых продуктов.',
  },
  {
    order: 10,
    slug: 'kogda-blizkie-tyanut-nazad-chto-delat',
    file: '10-kogda-blizkie-tyanut-nazad',
    title: 'Когда близкие тянут назад',
    seoTitle: 'Что делать, если близкие мешают похудеть',
    description:
      'Как реагировать, когда семья или друзья уговаривают «расслабиться» во время похудения — конкретные фразы и стратегии.',
  },
  {
    order: 11,
    slug: 'ves-vstal-chto-delat-pri-plato',
    file: '11-ves-vstal',
    title: 'Вес встал',
    seoTitle: 'Вес встал на месте — что делать при плато в похудении',
    description:
      'Пошаговая диагностика плато при похудении: как понять, реальный ли это застой, и что менять, если вес не двигается 2 недели.',
  },
  {
    order: 12,
    slug: 'intervalnoe-golodanie-rabotaet-li',
    file: '12-intervalnoe-golodanie',
    title: 'Интервальное голодание',
    seoTitle: 'Интервальное голодание для похудения — работает ли',
    description:
      'Что такое интервальное голодание, кому оно подходит и почему начинать с него — ошибка. Схемы 16/8, 14/10, 12/12 простыми словами.',
  },
  {
    order: 13,
    slug: 'ot-zhira-k-myshcam-kak-uderzhat-ves',
    file: '13-ot-zhira-k-myshcam',
    title: 'От жира к мышцам',
    seoTitle: 'Как накачаться после похудения и не набрать вес обратно',
    description:
      'Что делать после того, как сбросил вес: как перейти от похудения к набору мышц без возврата жира.',
  },
]

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug)
}

export function getPrevNext(slug: string): { prev?: Chapter; next?: Chapter } {
  const i = chapters.findIndex((c) => c.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  }
}
