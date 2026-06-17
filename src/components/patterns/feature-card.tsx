import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type FeatureCardProps = {
  title: string
  description: string
  icon: LucideIcon
  iconVariant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'chart1'
    | 'chart2'
    | 'chart3'
  interactive?: boolean
  className?: string
}

const iconVariants = {
  default: 'icon-tile',
  primary: 'icon-tile icon-tile-primary',
  secondary: 'icon-tile icon-tile-secondary',
  accent: 'icon-tile icon-tile-accent',
  chart1: 'icon-tile icon-tile-chart-1',
  chart2: 'icon-tile icon-tile-chart-2',
  chart3: 'icon-tile icon-tile-chart-3',
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconVariant = 'default',
  interactive = true,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'surface-card gap-0 py-0',
        interactive && 'surface-card-interactive',
        className,
      )}
    >
      <CardHeader className="gap-3">
        <div className={cn(iconVariants[iconVariant], 'mb-1')}>
          <Icon className="size-4.5" />
        </div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
