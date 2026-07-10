import type * as React from 'react'

import { cn } from '@/lib/utils'

type MemberV2StatCardProps = {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
  className?: string
}

export function MemberV2StatCard({
  title,
  value,
  helper,
  icon,
  className,
}: MemberV2StatCardProps) {
  return (
    <div
      className={cn(
        'stat-tile group text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="icon-tile transition-colors duration-200 group-hover:border-primary/30">
          {icon}
        </div>
      </div>

      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>

      <p className="stat-value mt-1.5 text-2xl font-bold tracking-tight tabular-nums sm:text-[1.65rem]">
        {value}
      </p>

      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{helper}</p>
    </div>
  )
}
