import { cn } from '@/lib/utils'

type MiniBarChartProps = {
  values?: number[]
  className?: string
}

const defaultValues = [40, 65, 45, 80, 55]

export function MiniBarChart({
  values = defaultValues,
  className,
}: MiniBarChartProps) {
  const max = Math.max(...values)

  return (
    <div className={cn('mini-bars', className)} aria-hidden>
      {values.map((value, i) => (
        <span
          key={i}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}
