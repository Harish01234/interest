import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Coins,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { MetricCard } from '@/components/patterns/metric-card'
import { SectionCard } from '@/components/patterns/section-card'
import {
  saveCalculation,
  startNewPeriod,
  type CalculationDto,
  type CalculationMemberRow,
} from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  cashInHome: string
  cashInShop: string
  cashToPersons: CashPersonRow[]
}

function dtoToForm(dto: CalculationDto): FormState {
  return {
    totalToBill: String(dto.totalToBill ?? 0),
    cashInHome: String(dto.cashInHome ?? 0),
    cashInShop: String(dto.cashInShop ?? 0),
    cashToPersons: dto.cashToPersons.map((entry) => ({
      name: entry.name,
      amount: String(entry.amount),
    })),
  }
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
  const [resetOpen, setResetOpen] = useState(false)

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

      return saveCalculation({
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
      setForm(dtoToForm(result))
      toast.success('Calculation saved')
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error ? saveError.message : 'Failed to save',
      )
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => startNewPeriod(),
    onSuccess: (result) => {
      queryClient.setQueryData(calculationQueryOptions.queryKey, result)
      setForm(dtoToForm(result))
      setResetOpen(false)
      toast.success('New period started')
    },
    onError: (resetError) => {
      toast.error(
        resetError instanceof Error ? resetError.message : 'Failed to reset',
      )
    },
  })

  // Live reconciliation from the current inputs + server-derived sums.
  const live = useMemo(() => {
    const asol = data?.asol ?? 0
    const interest = data?.interest ?? 0
    const dewa = data?.dewa ?? 0

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
  const isBusy = saveMutation.isPending || resetMutation.isPending

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

      {/* Derived metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          variant="chart1"
          label="Asol (settled principal)"
          value={formatMoney(live.asol)}
          hint={`${data?.settledMembers.length ?? 0} settled this period`}
        />
        <MetricCard
          variant="chart2"
          label="Interest (this period)"
          value={formatMoney(live.interest)}
          hint="From settled members"
        />
        <MetricCard
          variant="chart3"
          label="Dewa (new loans)"
          value={formatMoney(live.dewa)}
          hint={`${data?.addedMembers.length ?? 0} added this period`}
        />
      </div>

      {/* Manual inputs */}
      <SectionCard
        icon={Wallet}
        iconVariant="primary"
        title="Period inputs"
        description={
          periodStarted
            ? 'Enter the cash positions. Asol, Interest and Dewa are calculated automatically from members changed after the period started.'
            : 'Enter Total to bill to start this period. Settlements and new members after that point will feed Asol, Interest and Dewa.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy || !periodStarted}
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="size-4" />
              New period
            </Button>
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
          </div>
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

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new period?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears Total to bill and all cash inputs, and resets the period
              start. Asol, Interest and Dewa will count from now on. Member records
              are not changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={resetMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                resetMutation.mutate()
              }}
            >
              {resetMutation.isPending ? <Spinner className="size-4" /> : null}
              Start new period
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
