import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type SectionSaveButtonProps = {
  label: string
  pending?: boolean
  disabled?: boolean
  onClick: () => void
}

export function SectionSaveButton({
  label,
  pending = false,
  disabled = false,
  onClick,
}: SectionSaveButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      className="btn-primary-glow"
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={onClick}
    >
      {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
      {label}
    </Button>
  )
}
