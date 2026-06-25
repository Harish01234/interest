import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, LayoutGrid, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { SectionCard } from '@/components/patterns/section-card'
import {
  saveMainCalculation,
  type MainCalculationDto,
} from '@/members/main-calculation'
import { mainCalculationQueryOptions } from '@/members/main-calculation-queries'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { creditSumQueryOptions } from '@/members/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

function formatCell(value: number) {
  return value.toLocaleString('en-IN')
}

function parseAmount(value: string) {
  const parsed = Number.parseInt(value.replace(/,/g, '').trim() || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

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

type SheetRowProps = {
  leftLabel?: string
  leftValue?: React.ReactNode
  leftInput?: React.ReactNode
  rightLabel?: string
  rightValue?: React.ReactNode
  rightInput?: React.ReactNode
  isTotal?: boolean
  isSpacer?: boolean
}

function SheetRow({
  leftLabel,
  leftValue,
  leftInput,
  rightLabel,
  rightValue,
  rightInput,
  isTotal = false,
  isSpacer = false,
}: SheetRowProps) {
  if (isSpacer) {
    return (
      <div className="balance-sheet-row balance-sheet-spacer" aria-hidden>
        <div className="balance-sheet-label" />
        <div className="balance-sheet-value" />
        <div className="balance-sheet-label" />
        <div className="balance-sheet-value" />
      </div>
    )
  }

  return (
    <div
      className={cn('balance-sheet-row', isTotal && 'balance-sheet-row-total')}
    >
      <div className="balance-sheet-label">{leftLabel}</div>
      <div className="balance-sheet-value">
        {leftInput ?? (
          <span className="balance-sheet-number">{leftValue}</span>
        )}
      </div>
      <div className="balance-sheet-label">{rightLabel}</div>
      <div className="balance-sheet-value">
        {rightInput ?? (
          <span className="balance-sheet-number">{rightValue}</span>
        )}
      </div>
    </div>
  )
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
    mutationFn: () => {
      if (!form) {
        throw new Error('Form is not ready.')
      }

      return saveMainCalculation({
        data: {
          totalToBill: parseAmount(form.totalToBill),
          jinisChara: parseAmount(form.jinisChara),
        },
      })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(mainCalculationQueryOptions.queryKey, result)
      setForm(dtoToForm(result))
      toast.success('Main calculation saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save',
      )
    },
  })

  const live = useMemo(() => {
    const totalToBill = form ? parseAmount(form.totalToBill) : 0
    const bandak = creditSumData?.total ?? data?.bandak ?? 0
    const jinisChara = form ? parseAmount(form.jinisChara) : 0
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
      <div className="loading-panel" role="status" aria-label="Loading main calculation">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <SectionCard
        icon={LayoutGrid}
        iconVariant="chart2"
        title="Could not load main calculation"
        description={
          error instanceof Error ? error.message : 'Something went wrong.'
        }
      />
    )
  }

  const isBusy = saveMutation.isPending

  const numberInput = (
    id: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      className="balance-sheet-input"
      value={value}
      disabled={isBusy}
      onChange={(event) => onChange(event.target.value)}
    />
  )

  return (
    <SectionCard
      icon={LayoutGrid}
      iconVariant="chart2"
      title="Main calculation"
      description="Overall balance: TOBIL + SUDH (interest) must equal Laptop + Jinish chara + Cash. Laptop, SUDH, and Cash update automatically from members and the period calculation."
      actions={
        <Button
          type="button"
          size="sm"
          className="btn-primary-glow"
          disabled={isBusy}
          aria-busy={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          Save
        </Button>
      }
      bodyClassName="space-y-4"
    >
      <div
        className={cn(
          'recon-banner mb-1',
          live.isBalanced ? 'recon-banner-ok' : 'recon-banner-bad',
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          {live.isBalanced ? (
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          ) : (
            <XCircle className="size-5 shrink-0" aria-hidden />
          )}
          <p className="text-sm font-semibold">
            {live.isBalanced
              ? 'Main calculation is correct'
              : `Off by ${formatCell(Math.abs(live.difference))}`}
          </p>
        </div>
        <span className="text-xs opacity-90">VAL1 = VAL2</span>
      </div>

      <div className="balance-sheet-wrap">
        <div
          className="balance-sheet-grid"
          role="table"
          aria-label="Main calculation balance sheet"
        >
          <SheetRow
            leftLabel="TOBIL"
            rightLabel="LAPTOP"
            leftInput={numberInput('main-tobil', form.totalToBill, (v) =>
              setForm((c) => (c ? { ...c, totalToBill: v } : c)),
            )}
            rightValue={formatCell(live.bandak)}
          />
          <SheetRow
            leftLabel="SUDH"
            leftValue={formatCell(live.interest)}
            rightLabel="JINISH CHARA"
            rightInput={numberInput('main-jinish', form.jinisChara, (v) =>
              setForm((c) => (c ? { ...c, jinisChara: v } : c)),
            )}
          />
          <SheetRow
            rightLabel="CASH"
            rightValue={formatCell(live.cash)}
          />
          <SheetRow
            isTotal
            leftLabel="VAL1"
            leftValue={formatCell(live.leftTotal)}
            rightLabel="VAL2"
            rightValue={formatCell(live.rightTotal)}
          />
        </div>

        <p className="balance-sheet-hint text-muted-foreground">
          <span className="font-medium text-foreground">LAPTOP</span> = sum of
          active member credits ·{' '}
          <span className="font-medium text-foreground">SUDH</span> = period
          interest ·{' '}
          <span className="font-medium text-foreground">CASH</span> = period
          (ToBill + Asol + Interest − Dewa)
        </p>
      </div>
    </SectionCard>
  )
}
