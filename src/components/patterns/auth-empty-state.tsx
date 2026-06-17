import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type AuthEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function AuthEmptyState({
  icon: Icon,
  title,
  description,
}: AuthEmptyStateProps) {
  return (
    <Empty className="surface-card border border-dashed border-border px-6 py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="icon-tile size-12 rounded-xl">
          <Icon className="size-5" aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold">{title}</EmptyTitle>
        <EmptyDescription className="max-w-md text-sm leading-relaxed">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="btn-primary-glow rounded-full px-5" asChild>
          <Link to="/signin">Sign in to continue</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
