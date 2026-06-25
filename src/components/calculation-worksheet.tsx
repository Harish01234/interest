import { MainCalculationSheet } from '@/components/main-calculation-sheet'
import { PeriodCalculationSheet } from '@/components/period-calculation-sheet'

export function CalculationWorksheet() {
  return (
    <div className="calc-worksheet">
      <PeriodCalculationSheet />
      <MainCalculationSheet />
    </div>
  )
}
