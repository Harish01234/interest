import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Scale } from 'lucide-react'
import { toast } from 'sonner'

import {
  BalanceSheetRow,
  BalanceSheetScroll,
  formatSheetCell,
  parseSheetAmount,
  WorksheetPanel,
} from '@/components/balance-sheet'
import { InlineEditableAmountCell } from '@/components/inline-sheet-cell'
import { Spinner } from '@/components/ui/spinner'
import {
  saveMainCalculation,
  type MainCalculationDto,
} from '@/members/main-calculation'
import { mainCalculationQueryOptions } from '@/members/main-calculation-queries'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { creditSumQueryOptions } from '@/members/queries'

type MainFormState = {
  totalToBill: string
  jinisChara: string
}

function dtoToForm(dto: MainCalculationDto): MainFormState {
  return {
    totalToBill: String(dto.totalToBill ?? 0),
    jinisChara: String(dto.jinisChara ?? 0),
  }
}

export function MainCalculationSheet() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery(mainCalculationQueryOptions)
  const { data: periodData } = useQuery(calculationQueryOptions)
  const { data: creditSumData } = useQuery(creditSumQueryOptions)

  const [form, setForm] = useState<MainFormState | null>(null)

  useEffect(() => {
    if (data) {
      setForm(dtoToForm(data))
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (override?: Partial<MainFormState>) => {
      if (!form) throw new Error('Form is not ready.')

      return saveMainCalculation({
        data: {
          totalToBill: parseSheetAmount(override?.totalToBill ?? form.totalToBill),
          jinisChara: parseSheetAmount(override?.jinisChara ?? form.jinisChara),
        },
      })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(mainCalculationQueryOptions.queryKey, result)
      setForm(dtoToForm(result))
      toast.success('Saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save',
      )
    },
  })

  const live = useMemo(() => {
    const totalToBill = form ? parseSheetAmount(form.totalToBill) : 0
    const bandak = creditSumData?.total ?? data?.bandak ?? 0
    const jinisChara = form ? parseSheetAmount(form.jinisChara) : 0
    const interest = periodData?.interest ?? data?.interest ?? 0
    const cash = periodData?.leftTotal ?? data?.cash ?? 0

    const leftTotal = totalToBill + interest
    const rightTotal = bandak + jinisChara + cash
    const difference = leftTotal - rightTotal

    return {
      bandak,
      interest,
      cash,
      leftTotal,
      rightTotal,
      difference,
      isBalanced: difference === 0,
    }
  }, [creditSumData, data, form, periodData])

  if (isLoading || !form) {
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

  const isBusy = saveMutation.isPending

  const saveField = (field: keyof MainFormState, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current))
    saveMutation.mutate({ [field]: value })
  }

  return (
    <WorksheetPanel
      variant="main"
      icon={Scale}
      title="Main calculation"
      formula="TOBIL + SUDH = Laptop + Jinish chara + Cash"
      isBalanced={live.isBalanced}
      difference={live.difference}
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
      <p className="balance-sheet-hint text-muted-foreground">
        Tap the pencil icon to edit a value, then confirm with the check mark.
      </p>
      <BalanceSheetScroll minWidth={480} label="Main calculation balance sheet">
        <BalanceSheetRow
          leftLabel="TOBIL"
          leftLabelTheme="main"
          rightLabelTheme="main"
          leftInput={
            <InlineEditableAmountCell
              id="main-tobil"
              value={form.totalToBill}
              ariaLabel="TOBIL"
              disabled={isBusy}
              pending={saveMutation.isPending}
              onChange={(value) =>
                setForm((c) => (c ? { ...c, totalToBill: value } : c))
              }
              onSave={(value) => saveField('totalToBill', value)}
            />
          }
          rightLabel="LAPTOP"
          rightValue={formatSheetCell(live.bandak)}
        />
        <BalanceSheetRow
          leftLabel="SUDH"
          leftLabelTheme="main"
          rightLabelTheme="main"
          leftValue={formatSheetCell(live.interest)}
          rightLabel="JINISH CHARA"
          rightInput={
            <InlineEditableAmountCell
              id="main-jinish"
              value={form.jinisChara}
              ariaLabel="Jinish chara"
              disabled={isBusy}
              pending={saveMutation.isPending}
              onChange={(value) =>
                setForm((c) => (c ? { ...c, jinisChara: value } : c))
              }
              onSave={(value) => saveField('jinisChara', value)}
            />
          }
        />
        <BalanceSheetRow
          rightLabelTheme="main"
          rightLabel="CASH"
          rightValue={formatSheetCell(live.cash)}
        />
        <BalanceSheetRow
          isTotal
          totalVariant="main"
          leftLabel="VAL1"
          leftLabelTheme="main"
          leftValue={formatSheetCell(live.leftTotal)}
          rightLabel="VAL2"
          rightLabelTheme="main"
          rightValue={formatSheetCell(live.rightTotal)}
        />
      </BalanceSheetScroll>
    </WorksheetPanel>
  )
}
