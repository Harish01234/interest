import { useQuery } from '@tanstack/react-query'
import { Calculator } from 'lucide-react'

import {
  BalanceSheetRow,
  BalanceSheetScroll,
  formatSheetCell,
  WorksheetPanel,
} from '@/components/balance-sheet'
import {
  SheetReadOnlyAmountCell,
  SheetReadOnlyTextCell,
} from '@/components/inline-sheet-cell'
import { Spinner } from '@/components/ui/spinner'
import { calculationQueryOptions } from '@/members/calculation-queries'

function personLabel(name: string, fallback: string) {
  return (
    <SheetReadOnlyTextCell
      value={name}
      placeholder={fallback}
      uppercase
    />
  )
}

export function PeriodCalculationReadonlySheet() {
  const { data, isLoading, error } = useQuery(calculationQueryOptions)

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
        {error instanceof Error ? error.message : 'Could not load calculation.'}
      </div>
    )
  }

  const subtotal = data.totalToBill + data.asol + data.interest
  const personRows = data.cashToPersons
  const fixedPersonSlots = 3

  return (
    <WorksheetPanel
      variant="period"
      icon={Calculator}
      title="Period calculation"
      formula="ToBill + Asol + Interest − Dewa = Cash on hand"
      isBalanced={data.isBalanced}
      difference={data.difference}
    >
      <BalanceSheetScroll minWidth={580} label="Period calculation summary">
        <BalanceSheetRow
          leftLabel="TOBILL"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <SheetReadOnlyAmountCell amount={data.totalToBill} />
          }
          rightLabel="HOME"
          rightInput={
            <SheetReadOnlyAmountCell amount={data.cashInHome} />
          }
        />
        <BalanceSheetRow
          leftLabel="ASOL"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <SheetReadOnlyAmountCell
              amount={data.asol}
              memberAddon={data.memberAsol}
            />
          }
          rightLabel="DOKAN"
          rightInput={
            <SheetReadOnlyAmountCell amount={data.cashInShop} />
          }
        />
        <BalanceSheetRow
          leftLabel="SUDH"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <SheetReadOnlyAmountCell
              amount={data.interest}
              memberAddon={data.memberInterest}
            />
          }
          rightLabel={personLabel(personRows[0]?.name ?? '', 'Person 1')}
          rightInput={
            <SheetReadOnlyAmountCell amount={personRows[0]?.amount ?? 0} />
          }
        />
        <BalanceSheetRow
          leftLabel="TOTAL"
          leftLabelTheme="period-left"
          leftValue={formatSheetCell(subtotal)}
          rightLabelTheme="period-right"
          rightLabel={personLabel(personRows[1]?.name ?? '', 'Person 2')}
          rightInput={
            <SheetReadOnlyAmountCell amount={personRows[1]?.amount ?? 0} />
          }
        />
        <BalanceSheetRow
          leftLabel="DEWA"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <SheetReadOnlyAmountCell
              amount={data.dewa}
              memberAddon={data.memberDewa}
            />
          }
          rightLabel={personLabel(personRows[2]?.name ?? '', 'Person 3')}
          rightInput={
            <SheetReadOnlyAmountCell amount={personRows[2]?.amount ?? 0} />
          }
        />
        {personRows.slice(fixedPersonSlots).map((row, offset) => {
          const index = offset + fixedPersonSlots
          return (
            <BalanceSheetRow
              key={`${row.name}-${index}`}
              leftLabelTheme="period-left"
              rightLabelTheme="period-right"
              rightLabel={personLabel(row.name, `Person ${index + 1}`)}
              rightInput={
                <SheetReadOnlyAmountCell amount={row.amount} />
              }
            />
          )
        })}
        <BalanceSheetRow
          isTotal
          totalVariant="period"
          leftLabel="VAL1"
          leftLabelTheme="period-left"
          leftValue={formatSheetCell(data.leftTotal)}
          rightLabel="VAL2"
          rightLabelTheme="period-right"
          rightValue={formatSheetCell(data.rightTotal)}
        />
      </BalanceSheetScroll>
    </WorksheetPanel>
  )
}
