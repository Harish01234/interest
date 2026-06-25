import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Coins,
  Plus,
  Trash2,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { SectionCard } from '@/components/patterns/section-card'
import {
  saveCashPeriod,
  savePeriodTotals,
  type CalculationDto,
  type CalculationMemberRow,
} from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryKey } from '@/members/main-calculation-queries'
import { SectionSaveButton } from '@/components/section-save-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function formatMoney(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}₹ ${Math.abs(value).toLocaleString('en-IN')}`
}

function parseAmount(value: string) {
  const parsed = Number.parseInt(value.trim() || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

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

type PeriodTotalCardProps = {
  label: string
  variant: 'chart1' | 'chart2' | 'chart3'
  manualId: string
  manualValue: string
  memberValue: number
  totalValue: number
  memberHint: string
  disabled: boolean
  onManualChange: (value: string) => void
}

function PeriodTotalCard({
  label,
  variant,
  manualId,
  manualValue,
  memberValue,
  totalValue,
  memberHint,
  disabled,
  onManualChange,
}: PeriodTotalCardProps) {
  return (
    <div className={cn('calc-period-card', `calc-period-card-${variant}`)}>
      <div className="calc-period-card-header">
        <p className="calc-period-card-label">{label}</p>
        <p className="calc-period-card-total">{formatMoney(totalValue)}</p>
      </div>
      <div className="calc-period-card-body">
        <div className="space-y-1.5">
          <Label htmlFor={manualId} className="text-xs text-muted-foreground">
            Manual amount
          </Label>
          <Input
            id={manualId}
            type="number"
            inputMode="numeric"
            min={0}
            className="calc-period-input"
            value={manualValue}
            disabled={disabled}
            onChange={(event) => onManualChange(event.target.value)}
          />
        </div>
        <div className="calc-period-member-line">
          <span className="calc-period-plus">+</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">From members</p>
            <p className="font-semibold tabular-nums">{formatMoney(memberValue)}</p>
            <p className="text-xs text-muted-foreground">{memberHint}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberBreakdownTable({
  rows,
  showInterest,
  emptyLabel,
  creditLabel,
}: {
  rows: CalculationMemberRow[]
  showInterest: boolean
  emptyLabel: string
  creditLabel: string
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  const creditTotal = rows.reduce((sum, row) => sum + row.credit, 0)
  const interestTotal = rows.reduce((sum, row) => sum + row.interest, 0)

  return (
    <div className="data-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sl no</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">{creditLabel}</TableHead>
            {showInterest ? (
              <TableHead className="text-right">Interest</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.slNo}</TableCell>
              <TableCell className="max-w-48 truncate">{row.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(row.credit)}
              </TableCell>
              {showInterest ? (
                <TableCell className="text-right tabular-nums">
                  {formatMoney(row.interest)}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-chart-1">
              {formatMoney(creditTotal)}
            </TableCell>
            {showInterest ? (
              <TableCell className="text-right font-semibold tabular-nums text-chart-1">
                {formatMoney(interestTotal)}
              </TableCell>
            ) : null}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export function CalculationPanel() {
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
      if (!form) {
        throw new Error('Form is not ready.')
      }

      return savePeriodTotals({
        data: {
          manualAsol: parseAmount(form.manualAsol),
          manualInterest: parseAmount(form.manualInterest),
          manualDewa: parseAmount(form.manualDewa),
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
      if (!form) {
        throw new Error('Form is not ready.')
      }

      return saveCashPeriod({
        data: {
          totalToBill: parseAmount(form.totalToBill),
          cashInHome: parseAmount(form.cashInHome),
          cashInShop: parseAmount(form.cashInShop),
          cashToPersons: form.cashToPersons
            .filter((row) => row.name.trim())
            .map((row) => ({
              name: row.name.trim(),
              amount: parseAmount(row.amount),
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

  // Live reconciliation from the current inputs + server-derived sums.
  const live = useMemo(() => {
    const manualAsol = form ? parseAmount(form.manualAsol) : 0
    const manualInterest = form ? parseAmount(form.manualInterest) : 0
    const manualDewa = form ? parseAmount(form.manualDewa) : 0
    const memberAsol = data?.memberAsol ?? 0
    const memberInterest = data?.memberInterest ?? 0
    const memberDewa = data?.memberDewa ?? 0

    const asol = manualAsol + memberAsol
    const interest = manualInterest + memberInterest
    const dewa = manualDewa + memberDewa

    const totalToBill = form ? parseAmount(form.totalToBill) : 0
    const cashInHome = form ? parseAmount(form.cashInHome) : 0
    const cashInShop = form ? parseAmount(form.cashInShop) : 0
    const cashToPersonsTotal = form
      ? form.cashToPersons.reduce((sum, row) => sum + parseAmount(row.amount), 0)
      : 0

    const leftTotal = totalToBill + asol + interest - dewa
    const rightTotal = cashInHome + cashInShop + cashToPersonsTotal
    const difference = leftTotal - rightTotal

    return {
      manualAsol,
      manualInterest,
      manualDewa,
      memberAsol,
      memberInterest,
      memberDewa,
      asol,
      interest,
      dewa,
      leftTotal,
      rightTotal,
      difference,
      isBalanced: difference === 0,
    }
  }, [data, form])

  if (isLoading || !form) {
    return (
      <div className="loading-panel" role="status" aria-label="Loading calculation">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <SectionCard
        icon={Coins}
        iconVariant="primary"
        title="Could not load calculation"
        description={
          error instanceof Error ? error.message : 'Something went wrong.'
        }
      />
    )
  }

  const periodStarted = data?.periodStartedAt != null
  const isBusy = saveTotalsMutation.isPending || saveCashMutation.isPending

  const updatePerson = (index: number, patch: Partial<CashPersonRow>) =>
    setForm((current) =>
      current
        ? {
            ...current,
            cashToPersons: current.cashToPersons.map((row, i) =>
              i === index ? { ...row, ...patch } : row,
            ),
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

  const addPerson = () =>
    setForm((current) =>
      current
        ? {
            ...current,
            cashToPersons: [...current.cashToPersons, { name: '', amount: '' }],
          }
        : current,
    )

  return (
    <div className="flex flex-col gap-4">
      {/* Reconciliation banner */}
      <div
        className={cn(
          'recon-banner',
          live.isBalanced ? 'recon-banner-ok' : 'recon-banner-bad',
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          {live.isBalanced ? (
            <CheckCircle2 className="size-6 shrink-0" aria-hidden />
          ) : (
            <XCircle className="size-6 shrink-0" aria-hidden />
          )}
          <div>
            <p className="font-semibold">
              {live.isBalanced ? 'Calculation is correct' : 'Calculation is off'}
            </p>
            <p className="text-sm opacity-90">
              Left {formatMoney(live.leftTotal)} vs Right{' '}
              {formatMoney(live.rightTotal)}
              {live.isBalanced
                ? ''
                : ` · difference ${formatMoney(live.difference)}`}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="recon-badge">
          ToBill + Asol + Interest − Dewa = Cash
        </Badge>
      </div>

      {/* Period totals — manual + members */}
      <SectionCard
        icon={Coins}
        iconVariant="primary"
        title="Period totals (left side)"
        description="Enter manual base amounts for Asol, Interest and Dewa. Settling or adding members in this period adds on top automatically."
        actions={
          <SectionSaveButton
            label="Save totals"
            pending={saveTotalsMutation.isPending}
            disabled={isBusy}
            onClick={() => saveTotalsMutation.mutate()}
          />
        }
        bodyClassName="space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <PeriodTotalCard
            label="Asol"
            variant="chart1"
            manualId="calc-manual-asol"
            manualValue={form.manualAsol}
            memberValue={live.memberAsol}
            totalValue={live.asol}
            memberHint={`${data?.settledMembers.length ?? 0} settled this period`}
            disabled={isBusy}
            onManualChange={(value) =>
              setForm((c) => (c ? { ...c, manualAsol: value } : c))
            }
          />
          <PeriodTotalCard
            label="Interest"
            variant="chart2"
            manualId="calc-manual-interest"
            manualValue={form.manualInterest}
            memberValue={live.memberInterest}
            totalValue={live.interest}
            memberHint="From settled members"
            disabled={isBusy}
            onManualChange={(value) =>
              setForm((c) => (c ? { ...c, manualInterest: value } : c))
            }
          />
          <PeriodTotalCard
            label="Dewa"
            variant="chart3"
            manualId="calc-manual-dewa"
            manualValue={form.manualDewa}
            memberValue={live.memberDewa}
            totalValue={live.dewa}
            memberHint={`${data?.addedMembers.length ?? 0} added this period`}
            disabled={isBusy}
            onManualChange={(value) =>
              setForm((c) => (c ? { ...c, manualDewa: value } : c))
            }
          />
        </div>
      </SectionCard>

      {/* Manual inputs */}
      <SectionCard
        icon={Wallet}
        iconVariant="primary"
        title="Cash & period start"
        description={
          periodStarted
            ? 'Enter Total to bill and cash on the right side. Save this section separately from period totals above.'
            : 'Enter Total to bill to start this period. Settlements and new members after that point feed Asol, Interest and Dewa.'
        }
        actions={
          <SectionSaveButton
            label="Save cash"
            pending={saveCashMutation.isPending}
            disabled={isBusy}
            onClick={() => saveCashMutation.mutate()}
          />
        }
        bodyClassName="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="calc-total">Total to bill</Label>
            <Input
              id="calc-total"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.totalToBill}
              disabled={isBusy}
              onChange={(event) =>
                setForm((c) => (c ? { ...c, totalToBill: event.target.value } : c))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calc-home">Cash in home</Label>
            <Input
              id="calc-home"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.cashInHome}
              disabled={isBusy}
              onChange={(event) =>
                setForm((c) => (c ? { ...c, cashInHome: event.target.value } : c))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calc-shop">Cash in shop</Label>
            <Input
              id="calc-shop"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.cashInShop}
              disabled={isBusy}
              onChange={(event) =>
                setForm((c) => (c ? { ...c, cashInShop: event.target.value } : c))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Period started</Label>
            <div className="surface-muted flex h-9 items-center rounded-md px-3 text-sm tabular-nums text-muted-foreground">
              {data?.periodStartedAt
                ? new Date(data.periodStartedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not started'}
            </div>
          </div>
        </div>

        {/* Cash to persons editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Cash with persons</Label>
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
          </div>

          {form.cashToPersons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-5 text-center text-sm text-muted-foreground">
              No persons added. Use “Add person” to record cash held by others.
            </p>
          ) : (
            <div className="space-y-2">
              {form.cashToPersons.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <Input
                    className="sm:flex-1"
                    placeholder="Person name"
                    value={row.name}
                    disabled={isBusy}
                    onChange={(event) =>
                      updatePerson(index, { name: event.target.value })
                    }
                  />
                  <Input
                    className="sm:w-40"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Amount"
                    value={row.amount}
                    disabled={isBusy}
                    onChange={(event) =>
                      updatePerson(index, { amount: event.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove person ${index + 1}`}
                    disabled={isBusy}
                    onClick={() => removePerson(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Breakdown */}
      <SectionCard
        icon={ArrowDownCircle}
        iconVariant="chart1"
        title="Asol & Interest — settled members"
        description="Members deleted (settled) after the period started. Their credit becomes Asol and interest becomes Interest."
      >
        <MemberBreakdownTable
          rows={data?.settledMembers ?? []}
          showInterest
          creditLabel="Credit → Asol"
          emptyLabel={
            periodStarted
              ? 'No members settled in this period yet.'
              : 'Start the period to track settlements.'
          }
        />
      </SectionCard>

      <SectionCard
        icon={ArrowUpCircle}
        iconVariant="chart3"
        title="Dewa — newly added members"
        description="Members added after the period started. Their credit becomes Dewa (new loans given out)."
      >
        <MemberBreakdownTable
          rows={data?.addedMembers ?? []}
          showInterest={false}
          creditLabel="Credit → Dewa"
          emptyLabel={
            periodStarted
              ? 'No members added in this period yet.'
              : 'Start the period to track new members.'
          }
        />
      </SectionCard>
    </div>
  )
}
