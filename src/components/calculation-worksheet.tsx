import { MainCalculationSheet } from '@/components/main-calculation-sheet'
import { PeriodCalculationSheet } from '@/components/period-calculation-sheet'

export function CalculationWorksheet() {
  return (
    <section className="calc-worksheet" aria-label="Balance worksheets">
      <PeriodCalculationSheet />
      <MainCalculationSheet />
    </section>
  )
}
