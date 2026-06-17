import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  Card,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type IconVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'chart1'
  | 'chart2'
  | 'chart3'

const iconVariants: Record<IconVariant, string> = {
  default: 'icon-tile',
  primary: 'icon-tile icon-tile-primary',
  secondary: 'icon-tile icon-tile-secondary',
  accent: 'icon-tile icon-tile-accent',
  chart1: 'icon-tile icon-tile-chart-1',
  chart2: 'icon-tile icon-tile-chart-2',
  chart3: 'icon-tile icon-tile-chart-3',
}

type SectionCardProps = {
  icon: LucideIcon
  iconVariant?: IconVariant
  title: string
  description?: string
  actions?: ReactNode
  footer?: ReactNode
  footerAlign?: 'start' | 'between'
  children?: ReactNode
  className?: string
  bodyClassName?: string
  interactive?: boolean
}

export function SectionCard({
  icon: Icon,
  iconVariant = 'primary',
  title,
  description,
  actions,
  footer,
  footerAlign = 'start',
  children,
  className,
  bodyClassName,
  interactive = false,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        'surface-card gap-0 py-0',
        interactive && 'surface-card-interactive',
        className,
      )}
    >
      <div
        className={cn(
          'section-card-header',
          actions && 'section-card-header-split',
        )}
      >
        <div className="section-card-intro">
          <div className={cn(iconVariants[iconVariant])}>
            <Icon className="size-4.5" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="max-w-prose leading-relaxed">
                {description}
              </CardDescription>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      {children ? (
        <div className={cn('section-card-body', bodyClassName)}>{children}</div>
      ) : null}

      {footer ? (
        <div
          className={cn(
            'section-card-footer',
            footerAlign === 'between' && 'section-card-footer-between',
          )}
        >
          {footer}
        </div>
      ) : null}
    </Card>
  )
}
