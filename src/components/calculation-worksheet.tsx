import { MainCalculationReadonlySheet } from '@/components/main-calculation-readonly-sheet'
import { MainCalculationSheet } from '@/components/main-calculation-sheet'
import { PeriodCalculationReadonlySheet } from '@/components/period-calculation-readonly-sheet'
import { PeriodCalculationSheet } from '@/components/period-calculation-sheet'

type CalculationWorksheetProps = {
  readOnly?: boolean
}

export function CalculationWorksheet({ readOnly = false }: CalculationWorksheetProps) {
  return (
    <section className="calc-worksheet" aria-label="Balance worksheets">
      {readOnly ? (
        <>
          <PeriodCalculationReadonlySheet />
          <MainCalculationReadonlySheet />
        </>
      ) : (
        <>
          <PeriodCalculationSheet />
          <MainCalculationSheet />
        </>
      )}
    </section>
  )
}
