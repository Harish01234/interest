import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  badge?: string
  badgeVariant?: 'outline' | 'accent' | 'primary'
  title: ReactNode
  description?: string
  actions?: ReactNode
  className?: string
}

const badgeStyles = {
  outline: '',
  accent: 'badge-accent border-transparent bg-transparent',
  primary: 'badge-primary-soft border-transparent bg-transparent',
}

export function PageHeader({
  badge,
  badgeVariant = 'accent',
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        {badge ? (
          <Badge
            variant="outline"
            className={cn('rounded-full px-3 py-0.5', badgeStyles[badgeVariant])}
          >
            {badge}
          </Badge>
        ) : null}

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
