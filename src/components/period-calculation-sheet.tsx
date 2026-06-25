import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  BalanceSheetRow,
  BalanceSheetScroll,
  formatSheetCell,
  parseSheetAmount,
  WorksheetPanel,
} from '@/components/balance-sheet'
import {
  InlineEditableAmountCell,
  InlineEditableTextCell,
} from '@/components/inline-sheet-cell'
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

type ManualField = 'manualAsol' | 'manualInterest' | 'manualDewa'
type CashField = 'totalToBill' | 'cashInHome' | 'cashInShop'

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
    mutationFn: (override?: Partial<Record<ManualField, string>>) => {
      if (!form) throw new Error('Form is not ready.')
      return savePeriodTotals({
        data: {
          manualAsol: parseSheetAmount(override?.manualAsol ?? form.manualAsol),
          manualInterest: parseSheetAmount(
            override?.manualInterest ?? form.manualInterest,
          ),
          manualDewa: parseSheetAmount(override?.manualDewa ?? form.manualDewa),
        },
      })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(calculationQueryOptions.queryKey, result)
      queryClient.invalidateQueries({ queryKey: mainCalculationQueryKey })
      setForm(dtoToForm(result))
      toast.success('Saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save',
      )
    },
  })

  const saveCashMutation = useMutation({
    mutationFn: (override?: Partial<FormState>) => {
      if (!form) throw new Error('Form is not ready.')
      const next = { ...form, ...override }
      return saveCashPeriod({
        data: {
          totalToBill: parseSheetAmount(next.totalToBill),
          cashInHome: parseSheetAmount(next.cashInHome),
          cashInShop: parseSheetAmount(next.cashInShop),
          cashToPersons: next.cashToPersons
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
      toast.success('Saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save',
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

  const patchForm = (patch: Partial<FormState>) =>
    setForm((current) => (current ? { ...current, ...patch } : current))

  const patchManualField = (field: ManualField, value: string) =>
    patchForm({ [field]: value })

  const patchCashField = (field: CashField, value: string) =>
    patchForm({ [field]: value })

  const saveManualField = (field: ManualField, value: string) => {
    patchManualField(field, value)
    saveTotalsMutation.mutate({ [field]: value })
  }

  const saveCashField = (field: CashField, value: string) => {
    patchCashField(field, value)
    saveCashMutation.mutate({ [field]: value })
  }

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

  const savePersonField = (index: number, patch: Partial<CashPersonRow>) => {
    const rows = [...form.cashToPersons]
    while (rows.length <= index) {
      rows.push({ name: '', amount: '' })
    }
    rows[index] = { ...rows[index], ...patch }
    patchForm({ cashToPersons: rows })
    saveCashMutation.mutate({ cashToPersons: rows })
  }

  const addPerson = () =>
    setForm((current) =>
      current
        ? {
            ...current,
            cashToPersons: [...current.cashToPersons, { name: '', amount: '' }],
          }
        : current,
    )

  const removePerson = (index: number) => {
    const rows = form.cashToPersons.filter((_, i) => i !== index)
    patchForm({ cashToPersons: rows })
    saveCashMutation.mutate({ cashToPersons: rows })
  }

  const personLabelCell = (index: number, fallback: string) => (
    <InlineEditableTextCell
      id={`calc-person-name-${index}`}
      value={getPersonRow(index).name}
      placeholder={fallback}
      uppercase
      ariaLabel={`person ${index + 1} name`}
      disabled={isBusy}
      pending={saveCashMutation.isPending}
      onChange={(value) => updatePerson(index, { name: value })}
      onSave={(value) => savePersonField(index, { name: value })}
    />
  )

  const personAmountCell = (index: number) => (
    <InlineEditableAmountCell
      id={`calc-person-amount-${index}`}
      value={getPersonRow(index).amount}
      ariaLabel={`person ${index + 1} amount`}
      disabled={isBusy}
      pending={saveCashMutation.isPending}
      onChange={(value) => updatePerson(index, { amount: value })}
      onSave={(value) => savePersonField(index, { amount: value })}
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
      <p className="balance-sheet-hint text-muted-foreground">
        Tap the pencil icon to edit a value, then confirm with the check mark.
      </p>
      <BalanceSheetScroll minWidth={580} label="Period calculation">
        <BalanceSheetRow
          leftLabel="TOBILL"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <InlineEditableAmountCell
              id="calc-tobill"
              value={form.totalToBill}
              ariaLabel="TOBILL"
              disabled={isBusy}
              pending={saveCashMutation.isPending}
              onChange={(value) => patchCashField('totalToBill', value)}
              onSave={(value) => saveCashField('totalToBill', value)}
            />
          }
          rightLabel="HOME"
          rightInput={
            <InlineEditableAmountCell
              id="calc-home"
              value={form.cashInHome}
              ariaLabel="home cash"
              disabled={isBusy}
              pending={saveCashMutation.isPending}
              onChange={(value) => patchCashField('cashInHome', value)}
              onSave={(value) => saveCashField('cashInHome', value)}
            />
          }
        />
        <BalanceSheetRow
          leftLabel="ASOL"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <InlineEditableAmountCell
              id="calc-asol"
              value={form.manualAsol}
              displayAmount={live.asol}
              memberAddon={live.memberAsol}
              ariaLabel="manual Asol"
              disabled={isBusy}
              pending={saveTotalsMutation.isPending}
              onChange={(value) => patchManualField('manualAsol', value)}
              onSave={(value) => saveManualField('manualAsol', value)}
            />
          }
          rightLabel="DOKAN"
          rightInput={
            <InlineEditableAmountCell
              id="calc-shop"
              value={form.cashInShop}
              ariaLabel="shop cash"
              disabled={isBusy}
              pending={saveCashMutation.isPending}
              onChange={(value) => patchCashField('cashInShop', value)}
              onSave={(value) => saveCashField('cashInShop', value)}
            />
          }
        />
        <BalanceSheetRow
          leftLabel="SUDH"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <InlineEditableAmountCell
              id="calc-sudh"
              value={form.manualInterest}
              displayAmount={live.interest}
              memberAddon={live.memberInterest}
              ariaLabel="manual Sudh"
              disabled={isBusy}
              pending={saveTotalsMutation.isPending}
              onChange={(value) => patchManualField('manualInterest', value)}
              onSave={(value) => saveManualField('manualInterest', value)}
            />
          }
          rightLabel={personLabelCell(0, 'Person 1')}
          rightInput={personAmountCell(0)}
        />
        <BalanceSheetRow
          leftLabel="TOTAL"
          leftLabelTheme="period-left"
          leftValue={formatSheetCell(live.subtotal)}
          rightLabelTheme="period-right"
          rightLabel={personLabelCell(1, 'Person 2')}
          rightInput={personAmountCell(1)}
        />
        <BalanceSheetRow
          leftLabel="DEWA"
          leftLabelTheme="period-left"
          rightLabelTheme="period-right"
          leftInput={
            <InlineEditableAmountCell
              id="calc-dewa"
              value={form.manualDewa}
              displayAmount={live.dewa}
              memberAddon={live.memberDewa}
              ariaLabel="manual Dewa"
              disabled={isBusy}
              pending={saveTotalsMutation.isPending}
              onChange={(value) => patchManualField('manualDewa', value)}
              onSave={(value) => saveManualField('manualDewa', value)}
            />
          }
          rightLabel={personLabelCell(2, 'Person 3')}
          rightInput={personAmountCell(2)}
        />
        {extraPersonRows.map((row, offset) => {
          const index = offset + 3
          return (
            <BalanceSheetRow
              key={index}
              leftLabelTheme="period-left"
              rightLabelTheme="period-right"
              rightLabel={personLabelCell(index, `Person ${index + 1}`)}
              rightInput={
                <div className="inline-sheet-cell inline-sheet-cell-with-extra">
                  {personAmountCell(index)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="inline-sheet-cell-action inline-sheet-cell-action-destructive"
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
