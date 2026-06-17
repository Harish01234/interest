import type { ReactNode } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: ReactNode
  hint?: string
  loading?: boolean
  variant?: 'chart1' | 'chart2' | 'chart3'
  className?: string
}

const variantClass = {
  chart1: 'stat-tile-chart-1',
  chart2: 'stat-tile-chart-2',
  chart3: 'stat-tile-chart-3',
}

export function MetricCard({
  label,
  value,
  hint,
  loading = false,
  variant = 'chart1',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn('metric-highlight stat-tile', variantClass[variant], className)}
      role="status"
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <Spinner className="size-5 text-primary" aria-label="Loading metric" />
      ) : (
        <>
          <p className="metric-highlight-value stat-value">{value}</p>
          <p className="metric-highlight-label">{label}</p>
          {hint ? (
            <p className="text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </>
      )}
    </div>
  )
}
