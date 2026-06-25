import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CalendarOff } from 'lucide-react'

import { ClearAllCalculationsButton } from '@/components/start-fresh-calculation-button'
import { Badge } from '@/components/ui/badge'
import { calculationQueryOptions } from '@/members/calculation-queries'

export function CalculationPeriodToolbar() {
  const { data } = useQuery(calculationQueryOptions)
  const periodStartedAt = data?.periodStartedAt

  return (
    <div className="calc-period-toolbar">
      <div className="calc-period-toolbar-status">
        {periodStartedAt ? (
          <Badge
            variant="outline"
            className="calc-period-badge calc-period-badge-active gap-1.5 rounded-full px-3 py-1.5 font-medium"
          >
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            <span>
              Period active ·{' '}
              {new Date(periodStartedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="calc-period-badge calc-period-badge-inactive gap-1.5 rounded-full px-3 py-1.5 font-medium"
          >
            <CalendarOff className="size-3.5 shrink-0" aria-hidden />
            <span>No active period</span>
          </Badge>
        )}
        <p className="calc-period-toolbar-hint">
          {periodStartedAt
            ? 'Member settlements and new entries are tracked from this date.'
            : 'Enter TOBILL and use “Save TOBILL & cash” in the period sheet to start.'}
        </p>
      </div>

      <div className="calc-period-toolbar-reset">
        <p className="calc-period-toolbar-reset-label">Reset everything</p>
        <p className="calc-period-toolbar-reset-hint">
          Clears period and main calculations. Members are not deleted.
        </p>
        <ClearAllCalculationsButton />
      </div>
    </div>
  )
}
