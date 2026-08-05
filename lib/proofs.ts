// Подсказки-источники для конкретных фактов в тексте.
// Структура расширяемая: добавь объект сюда и оберни фразу в главе
// в <Proof id="...">…</Proof>. Начато с трёх самых важных фактов;
// остальные тексты источников будут переданы отдельно.
export type ProofEntry = {
  id: string
  /** Короткая формулировка факта, который подтверждается */
  claim: string
  /** Библиографическая ссылка */
  source: string
  doi?: string
  /** Необязательное пояснение */
  note?: string
}

export const proofs: ProofEntry[] = [
  {
    id: 'fat-breath',
    claim:
      'Около 84% потерянного жира покидает тело через лёгкие в виде углекислого газа, остальное — с мочой и потом.',
    source:
      'Meerman, R., & Brown, A.J. (2014). When somebody loses weight, where does the fat go? BMJ, 349, g7257.',
    doi: '10.1136/bmj.g7257',
    note: 'Расчёт по стехиометрии окисления жира: из 10 кг триглицеридов 8,4 кг выдыхаются как CO₂, 1,6 кг выводятся в виде воды.',
  },
  {
    id: 'adaptive-thermogenesis',
    claim:
      'При длительном дефиците энергии организм снижает собственный расход: падает бытовая активность, замедляются гормональные процессы.',
    source:
      'Trexler, E.T., Smith-Ryan, A.E., & Norton, L.E. (2014). Metabolic adaptation to weight loss: implications for the athlete. Journal of the International Society of Sports Nutrition, 11, 7.',
    doi: '10.1186/1550-2783-11-7',
  },
  {
    id: 'ironic-processes',
    claim:
      'Попытка подавить мысль делает её навязчивее: мозгу приходится удерживать запретное в памяти, чтобы проверять, не думает ли он о нём.',
    source:
      'Wegner, D.M. (1994). Ironic processes of mental control. Psychological Review, 101(1), 34–52.',
    doi: '10.1037/0033-295X.101.1.34',
  },
]

export function getProof(id: string): ProofEntry | undefined {
  return proofs.find((p) => p.id === id)
}
