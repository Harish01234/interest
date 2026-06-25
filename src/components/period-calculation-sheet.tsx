import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, Calculator, PenLine, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  BalanceSheetRow,
  BalanceSheetScroll,
  formatSheetCell,
  ManualTotalCell,
  parseSheetAmount,
  SheetLabelInput,
  SheetNumberInput,
  WorksheetPanel,
} from '@/components/balance-sheet'
import { SectionSaveButton } from '@/components/section-save-button'
import {
  WorksheetActionGroup,
  WorksheetActionGroups,
} from '@/components/worksheet-action-group'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  saveCashPeriod,
  savePeriodTotals,
  type CalculationDto,
} from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryKey } from '@/members/main-calculation-queries'

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
      toast.success('Manual Asol, Sudh & Dewa saved')
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
      toast.success('TOBILL & cash saved')
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
      difference: leftTotal - rightTotal,
      isBalanced: leftTotal === rightTotal,
    }
  }, [data, form])

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

  const personLabelInput = (index: number, fallback: string) => (
    <SheetLabelInput
      id={`calc-person-name-${index}`}
      value={getPersonRow(index).name}
      placeholder={fallback}
      theme="period-right"
      disabled={isBusy}
      onChange={(value) => updatePerson(index, { name: value })}
    />
  )

  const personAmountInput = (index: number) => (
    <SheetNumberInput
      id={`calc-person-amount-${index}`}
      value={getPersonRow(index).amount}
      disabled={isBusy}
      onChange={(value) => updatePerson(index, { amount: value })}
    />
  )

  const extraPersonRows = form.cashToPersons.slice(3)

  return (
    <WorksheetPanel
      variant="period"
      icon={Calculator}
      title="Period calculation"
      formula="ToBill + Asol + Interest − Dewa = Cash on hand"
      isBalanced={live.isBalanced}
      difference={live.difference}
      actionGroups={
        <WorksheetActionGroups>
          <WorksheetActionGroup
            accent="period"
            title="Manual adjustments"
            description="Save your manual Asol, Sudh (interest), and Dewa entries. Member credits are added automatically."
          >
            <SectionSaveButton
              label="Save Asol, Sudh & Dewa"
              icon={PenLine}
              pending={saveTotalsMutation.isPending}
              disabled={isBusy}
              onClick={() => saveTotalsMutation.mutate()}
            />
          </WorksheetActionGroup>
          <WorksheetActionGroup
            accent="period"
            title="Billing & cash on hand"
            description="Save TOBILL, home/shop cash, and person payments. Entering TOBILL starts the billing period."
          >
            <SectionSaveButton
              label="Save TOBILL & cash"
              icon={Banknote}
              pending={saveCashMutation.isPending}
              disabled={isBusy}
              onClick={() => saveCashMutation.mutate()}
            />
          </WorksheetActionGroup>
        </WorksheetActionGroups>
      }
      footer={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={addPerson}
        >
          <Plus className="size-4" />
          Add cash recipient
        </Button>
      }
    >
      <BalanceSheetScroll minWidth={580} label="Period calculation">
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
          rightLabel={personLabelInput(0, 'Person 1')}
          rightInput={personAmountInput(0)}
        />
        <BalanceSheetRow
          leftLabel="TOTAL"
          leftLabelTheme="period-left"
          leftValue={formatSheetCell(live.subtotal)}
          rightLabelTheme="period-right"
          rightLabel={personLabelInput(1, 'Person 2')}
          rightInput={personAmountInput(1)}
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
          rightLabel={personLabelInput(2, 'Person 3')}
          rightInput={personAmountInput(2)}
        />
        {extraPersonRows.map((row, offset) => {
          const index = offset + 3
          return (
            <BalanceSheetRow
              key={index}
              leftLabelTheme="period-left"
              rightLabelTheme="period-right"
              rightLabel={personLabelInput(index, `Person ${index + 1}`)}
              rightInput={
                <div className="flex w-full min-w-0 items-center gap-1">
                  {personAmountInput(index)}
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
      </BalanceSheetScroll>
    </WorksheetPanel>
  )
}
