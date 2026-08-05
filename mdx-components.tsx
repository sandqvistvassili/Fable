import type { MDXComponents } from 'mdx/types'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import Proof from '@/components/Proof'
import Term from '@/components/Term'
import Calculator from '@/components/Calculator'
import WeightTrendDemo from '@/components/WeightTrendDemo'
import WeightTracker from '@/components/WeightTracker'
import PlateauDiagnostic from '@/components/PlateauDiagnostic'
import DailyWin from '@/components/DailyWin'
import ElephantIllustration from '@/components/ElephantIllustration'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Таблицы шире колонки прокручиваются внутри своей рамки
    table: (props) => (
      <div className="table-wrap">
        <table {...props} />
      </div>
    ),
    // Подставляется автоматически remark-плагином глоссария
    G: GlossaryTooltip,
    Proof,
    Term,
    Calculator,
    WeightTrendDemo,
    WeightTracker,
    PlateauDiagnostic,
    DailyWin,
    ElephantIllustration,
    ...components,
  }
}
