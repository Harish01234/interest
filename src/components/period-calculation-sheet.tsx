import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
  BalanceSheetRow,
  formatSheetCell,
  ManualTotalCell,
  parseSheetAmount,
  PersonSheetInput,
  SheetNumberInput,
} from '@/components/balance-sheet'
import { SectionSaveButton } from '@/components/section-save-button'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  saveCashPeriod,
  savePeriodTotals,
  type CalculationDto,
} from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryKey } from '@/members/main-calculation-queries'
import { cn } from '@/lib/utils'

type CashPersonRow = { name: string; amount: string }

type FormState = {
  totalToBill: string
  manualAsol: string
  manualInterest: string
  manualDewa: string
  cashInHome: string
  cashInShop: string
  cashToPersons: CashPersonRow[]
}

function dtoToForm(dto: CalculationDto): FormState {
  return {
    totalToBill: String(dto.totalToBill ?? 0),
    manualAsol: String(dto.manualAsol ?? 0),
    manualInterest: String(dto.manualInterest ?? 0),
    manualDewa: String(dto.manualDewa ?? 0),
    cashInHome: String(dto.cashInHome ?? 0),
    cashInShop: String(dto.cashInShop ?? 0),
    cashToPersons: dto.cashToPersons.map((entry) => ({
      name: entry.name,
      amount: String(entry.amount),
    })),
  }
}

export function PeriodCalculationSheet() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery(calculationQueryOptions)
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    if (data) {
      setForm(dtoToForm(data))
    }
  }, [data])

  const saveTotalsMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error('Form is not ready.')
      return savePeriodTotals({
        data: {
          manualAsol: parseSheetAmount(form.manualAsol),
          manualInterest: parseSheetAmount(form.manualInterest),
          manualDewa: parseSheetAmount(form.manualDewa),
        },
      })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(calculationQueryOptions.queryKey, result)
      queryClient.invalidateQueries({ queryKey: mainCalculationQueryKey })
      setForm(dtoToForm(result))
      toast.success('Period totals saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save totals',
      )
    },
  })

  const saveCashMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error('Form is not ready.')
      return saveCashPeriod({
        data: {
          totalToBill: parseSheetAmount(form.totalToBill),
          cashInHome: parseSheetAmount(form.cashInHome),
          cashInShop: parseSheetAmount(form.cashInShop),
          cashToPersons: form.cashToPersons
            .filter((row) => row.name.trim())
            .map((row) => ({
              name: row.name.trim(),
              amount: parseSheetAmount(row.amount),
            })),
        },
      })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(calculationQueryOptions.queryKey, result)
      queryClient.invalidateQueries({ queryKey: mainCalculationQueryKey })
      setForm(dtoToForm(result))
      toast.success('Cash & period saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save cash',
      )
    },
  })

  const live = useMemo(() => {
    const manualAsol = form ? parseSheetAmount(form.manualAsol) : 0
    const manualInterest = form ? parseSheetAmount(form.manualInterest) : 0
    const manualDewa = form ? parseSheetAmount(form.manualDewa) : 0
    const memberAsol = data?.memberAsol ?? 0
    const memberInterest = data?.memberInterest ?? 0
    const memberDewa = data?.memberDewa ?? 0

    const asol = manualAsol + memberAsol
    const interest = manualInterest + memberInterest
    const dewa = manualDewa + memberDewa

    const totalToBill = form ? parseSheetAmount(form.totalToBill) : 0
    const cashInHome = form ? parseSheetAmount(form.cashInHome) : 0
    const cashInShop = form ? parseSheetAmount(form.cashInShop) : 0
    const cashToPersonsTotal = form
      ? form.cashToPersons.reduce(
          (sum, row) => sum + parseSheetAmount(row.amount),
          0,
        )
      : 0

    const subtotal = totalToBill + asol + interest
    const leftTotal = subtotal - dewa
    const rightTotal = cashInHome + cashInShop + cashToPersonsTotal
    const difference = leftTotal - rightTotal

    return {
      memberAsol,
      memberInterest,
      memberDewa,
      asol,
      interest,
      dewa,
      subtotal,
      leftTotal,
      rightTotal,
      difference,
      isBalanced: difference === 0,
    }
  }, [data, form])

  if (isLoading || !form) {
    return (
      <div className="calc-worksheet-panel loading-panel" role="status">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="calc-worksheet-panel calc-worksheet-panel-error">
        {error instanceof Error ? error.message : 'Could not load calculation.'}
      </div>
    )
  }

  const isBusy = saveTotalsMutation.isPending || saveCashMutation.isPending

  const getPersonRow = (index: number): CashPersonRow =>
    form.cashToPersons[index] ?? { name: '', amount: '' }

  const updatePerson = (index: number, patch: Partial<CashPersonRow>) =>
    setForm((current) => {
      if (!current) return current
      const rows = [...current.cashToPersons]
      while (rows.length <= index) {
        rows.push({ name: '', amount: '' })
      }
      rows[index] = { ...rows[index], ...patch }
      return { ...current, cashToPersons: rows }
    })

  const addPerson = () =>
    setForm((current) =>
      current
        ? {
            ...current,
            cashToPersons: [...current.cashToPersons, { name: '', amount: '' }],
          }
        : current,
    )

  const removePerson = (index: number) =>
    setForm((current) =>
      current
        ? {
            ...current,
            cashToPersons: current.cashToPersons.filter((_, i) => i !== index),
          }
        : current,
    )

  const personRightCell = (index: number) => {
    const row = getPersonRow(index)

    return (
      <PersonSheetInput
        nameId={`calc-person-name-${index}`}
        amountId={`calc-person-amount-${index}`}
        name={row.name}
        amount={row.amount}
        disabled={isBusy}
        onNameChange={(value) => updatePerson(index, { name: value })}
        onAmountChange={(value) => updatePerson(index, { amount: value })}
      />
    )
  }

  const personLabel = (index: number, fallback: string) =>
    getPersonRow(index).name.trim() || fallback

  const extraPersonRows = form.cashToPersons.slice(3)

  return (
    <div className="calc-worksheet-panel">
      <div className="calc-worksheet-panel-header">
        <div>
          <h3 className="calc-worksheet-panel-title">Calculation</h3>
          <p className="calc-worksheet-panel-desc">
            ToBill + Asol + Interest − Dewa = Cash
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionSaveButton
            label="Save totals"
            pending={saveTotalsMutation.isPending}
            disabled={isBusy}
            onClick={() => saveTotalsMutation.mutate()}
          />
          <SectionSaveButton
            label="Save cash"
            pending={saveCashMutation.isPending}
            disabled={isBusy}
            onClick={() => saveCashMutation.mutate()}
          />
        </div>
      </div>

      <div
        className={cn(
          'calc-worksheet-recon',
          live.isBalanced ? 'recon-banner-ok' : 'recon-banner-bad',
        )}
        role="status"
      >
        {live.isBalanced ? (
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        ) : (
          <XCircle className="size-4 shrink-0" aria-hidden />
        )}
        <span className="text-xs font-semibold">
          {live.isBalanced
            ? 'Balanced'
            : `Off by ${formatSheetCell(Math.abs(live.difference))}`}
        </span>
      </div>

      <div className="balance-sheet-wrap">
        <div
          className="balance-sheet-grid balance-sheet-grid-period"
          role="table"
          aria-label="Period calculation"
        >
          <BalanceSheetRow
            leftLabel="TOBILL"
            leftLabelTheme="period-left"
            rightLabelTheme="period-right"
            leftInput={
              <SheetNumberInput
                id="calc-tobill"
                value={form.totalToBill}
                disabled={isBusy}
                onChange={(value) =>
                  setForm((c) => (c ? { ...c, totalToBill: value } : c))
                }
              />
            }
            rightLabel="HOME"
            rightInput={
              <SheetNumberInput
                id="calc-home"
                value={form.cashInHome}
                disabled={isBusy}
                onChange={(value) =>
                  setForm((c) => (c ? { ...c, cashInHome: value } : c))
                }
              />
            }
          />
          <BalanceSheetRow
            leftLabel="ASOL"
            leftLabelTheme="period-left"
            rightLabelTheme="period-right"
            leftInput={
              <ManualTotalCell
                id="calc-asol"
                manualValue={form.manualAsol}
                memberValue={live.memberAsol}
                totalValue={live.asol}
                disabled={isBusy}
                onManualChange={(value) =>
                  setForm((c) => (c ? { ...c, manualAsol: value } : c))
                }
              />
            }
            rightLabel="DOKAN"
            rightInput={
              <SheetNumberInput
                id="calc-shop"
                value={form.cashInShop}
                disabled={isBusy}
                onChange={(value) =>
                  setForm((c) => (c ? { ...c, cashInShop: value } : c))
                }
              />
            }
          />
          <BalanceSheetRow
            leftLabel="SUDH"
            leftLabelTheme="period-left"
            rightLabelTheme="period-right"
            leftInput={
              <ManualTotalCell
                id="calc-sudh"
                manualValue={form.manualInterest}
                memberValue={live.memberInterest}
                totalValue={live.interest}
                disabled={isBusy}
                onManualChange={(value) =>
                  setForm((c) => (c ? { ...c, manualInterest: value } : c))
                }
              />
            }
            rightLabel={personLabel(0, 'PERSON 1')}
            rightInput={personRightCell(0)}
          />
          <BalanceSheetRow
            leftLabel="TOTAL"
            leftLabelTheme="period-left"
            leftValue={formatSheetCell(live.subtotal)}
            rightLabelTheme="period-right"
            rightLabel={personLabel(1, 'PERSON 2')}
            rightInput={personRightCell(1)}
          />
          <BalanceSheetRow
            leftLabel="DEWA"
            leftLabelTheme="period-left"
            rightLabelTheme="period-right"
            leftInput={
              <ManualTotalCell
                id="calc-dewa"
                manualValue={form.manualDewa}
                memberValue={live.memberDewa}
                totalValue={live.dewa}
                disabled={isBusy}
                onManualChange={(value) =>
                  setForm((c) => (c ? { ...c, manualDewa: value } : c))
                }
              />
            }
            rightLabel={personLabel(2, 'PERSON 3')}
            rightInput={personRightCell(2)}
          />
          {extraPersonRows.map((row, offset) => {
            const index = offset + 3
            return (
              <BalanceSheetRow
                key={index}
                leftLabelTheme="period-left"
                rightLabelTheme="period-right"
                rightLabel={row.name.trim() || `PERSON ${index + 1}`}
                rightInput={
                  <div className="flex w-full items-center gap-1">
                    {personRightCell(index)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={isBusy}
                      aria-label={`Remove person ${index + 1}`}
                      onClick={() => removePerson(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                }
              />
            )
          })}
          <BalanceSheetRow
            isTotal
            totalVariant="period"
            leftLabel="VAL1"
            leftLabelTheme="period-left"
            leftValue={formatSheetCell(live.leftTotal)}
            rightLabel="VAL2"
            rightLabelTheme="period-right"
            rightValue={formatSheetCell(live.rightTotal)}
          />
        </div>

        <div className="calc-worksheet-sheet-footer">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={addPerson}
          >
            <Plus className="size-4" />
            Add person
          </Button>
          <span className="text-xs text-muted-foreground">
            Period:{' '}
            {data?.periodStartedAt
              ? new Date(data.periodStartedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Not started — save TOBILL to begin'}
          </span>
        </div>
      </div>
    </div>
  )
}
