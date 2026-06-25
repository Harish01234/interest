import { useQuery } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

import { SectionCard } from '@/components/patterns/section-card'
import type { CalculationMemberRow } from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'

function formatMoney(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}₹ ${Math.abs(value).toLocaleString('en-IN')}`
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
  const { data, isLoading, error } = useQuery(calculationQueryOptions)

  if (isLoading) {
    return (
      <div className="loading-panel" role="status" aria-label="Loading breakdown">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <SectionCard
        icon={ArrowDownCircle}
        iconVariant="chart1"
        title="Could not load member breakdown"
        description={
          error instanceof Error ? error.message : 'Something went wrong.'
        }
      />
    )
  }

  const periodStarted = data?.periodStartedAt != null

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={ArrowDownCircle}
        iconVariant="chart1"
        title="Asol & Interest — settled members"
        description="Members settled after the period started. Their credit adds to Asol and interest to Sudh."
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
        description="Members added after the period started. Their credit adds to Dewa."
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
