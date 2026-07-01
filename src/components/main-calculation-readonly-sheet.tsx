import { useQuery } from '@tanstack/react-query'
import { Scale } from 'lucide-react'

import {
  BalanceSheetRow,
  BalanceSheetScroll,
  formatSheetCell,
  WorksheetPanel,
} from '@/components/balance-sheet'
import { SheetReadOnlyAmountCell } from '@/components/inline-sheet-cell'
import { Spinner } from '@/components/ui/spinner'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryOptions } from '@/members/main-calculation-queries'
import { creditSumQueryOptions } from '@/members/queries'

export function MainCalculationReadonlySheet() {
  const { data, isLoading, error } = useQuery(mainCalculationQueryOptions)
  const { data: periodData } = useQuery(calculationQueryOptions)
  const { data: creditSumData } = useQuery(creditSumQueryOptions)

  if (isLoading || !data) {
    return (
      <div className="calc-worksheet-panel loading-panel min-h-48" role="status">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="calc-worksheet-panel calc-worksheet-panel-error min-h-48 p-6">
        {error instanceof Error ? error.message : 'Could not load main calculation.'}
      </div>
    )
  }

  const bandak = creditSumData?.total ?? data.bandak ?? 0
  const interest = periodData?.interest ?? data.interest ?? 0
  const cash = periodData?.leftTotal ?? data.cash ?? 0
  const leftTotal = data.totalToBill + interest
  const rightTotal = bandak + data.jinisChara + cash
  const difference = leftTotal - rightTotal

  return (
    <WorksheetPanel
      variant="main"
      icon={Scale}
      title="Main calculation"
      formula="TOBIL + SUDH = Laptop + Jinish chara + Cash"
      isBalanced={difference === 0}
      difference={difference}
      footer={
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">LAPTOP</span> = active
          member credits ·{' '}
          <span className="font-medium text-foreground">SUDH</span> and{' '}
          <span className="font-medium text-foreground">CASH</span> sync from
          period calculation
        </p>
      }
    >
      <BalanceSheetScroll minWidth={480} label="Main calculation summary">
        <BalanceSheetRow
          leftLabel="TOBIL"
          leftLabelTheme="main"
          rightLabelTheme="main"
          leftInput={
            <SheetReadOnlyAmountCell amount={data.totalToBill} />
          }
          rightLabel="LAPTOP"
          rightValue={formatSheetCell(bandak)}
        />
        <BalanceSheetRow
          leftLabel="SUDH"
          leftLabelTheme="main"
          rightLabelTheme="main"
          leftValue={formatSheetCell(interest)}
          rightLabel="JINISH CHARA"
          rightInput={
            <SheetReadOnlyAmountCell amount={data.jinisChara} />
          }
        />
        <BalanceSheetRow
          rightLabelTheme="main"
          rightLabel="CASH"
          rightValue={formatSheetCell(cash)}
        />
        <BalanceSheetRow
          isTotal
          totalVariant="main"
          leftLabel="VAL1"
          leftLabelTheme="main"
          leftValue={formatSheetCell(leftTotal)}
          rightLabel="VAL2"
          rightLabelTheme="main"
          rightValue={formatSheetCell(rightTotal)}
        />
      </BalanceSheetScroll>
    </WorksheetPanel>
  )
}
