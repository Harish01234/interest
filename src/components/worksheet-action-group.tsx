import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type WorksheetActionGroupProps = {
  title: string
  description: string
  children: ReactNode
  accent?: 'period' | 'main' | 'neutral'
  className?: string
}

const accentStyles = {
  period: 'worksheet-action-group-period',
  main: 'worksheet-action-group-main',
  neutral: 'worksheet-action-group-neutral',
}

export function WorksheetActionGroup({
  title,
  description,
  children,
  accent = 'neutral',
  className,
}: WorksheetActionGroupProps) {
  return (
    <div className={cn('worksheet-action-group', accentStyles[accent], className)}>
      <div className="worksheet-action-group-copy">
        <p className="worksheet-action-group-title">{title}</p>
        <p className="worksheet-action-group-description">{description}</p>
      </div>
      <div className="worksheet-action-group-control">{children}</div>
    </div>
  )
}

export function WorksheetActionGroups({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('worksheet-action-groups', className)}>{children}</div>
  )
}
