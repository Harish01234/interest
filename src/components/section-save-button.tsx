import type { LucideIcon } from 'lucide-react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

type SectionSaveButtonProps = {
  label: string
  pending?: boolean
  disabled?: boolean
  icon?: LucideIcon
  variant?: 'default' | 'outline'
  className?: string
  onClick: () => void
}

export function SectionSaveButton({
  label,
  pending = false,
  disabled = false,
  icon: Icon = Save,
  variant = 'default',
  className,
  onClick,
}: SectionSaveButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={cn(variant === 'default' && 'btn-primary-glow', className)}
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={onClick}
    >
      {pending ? <Spinner className="size-4" /> : <Icon className="size-4" />}
      {label}
    </Button>
  )
}
