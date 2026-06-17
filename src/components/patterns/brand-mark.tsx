import { Hexagon } from 'lucide-react'

import { cn } from '@/lib/utils'

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizes = {
  sm: { box: 'size-8', icon: 'size-4', title: 'text-sm', tagline: 'text-[10px]' },
  md: { box: 'size-9', icon: 'size-5', title: 'text-base', tagline: 'text-[11px]' },
  lg: { box: 'size-14', icon: 'size-8', title: 'text-xl', tagline: 'text-xs' },
}

export function BrandMark({
  size = 'md',
  showWordmark = true,
  className,
}: BrandMarkProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)] ring-1 ring-primary/30',
          s.box,
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-br from-chart-1/30 to-transparent" />
        <Hexagon className={cn('relative stroke-[1.75]', s.icon)} />
      </div>

      {showWordmark ? (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-heading font-semibold leading-none tracking-tight text-foreground',
              s.title,
            )}
          >
            Interest
          </span>
          <span className={cn('font-medium text-chart-1', s.tagline)}>
            Build what matters
          </span>
        </div>
      ) : null}
    </div>
  )
}
