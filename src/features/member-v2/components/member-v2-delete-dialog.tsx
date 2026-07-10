import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import type { MemberV2Row } from '@/features/member-v2/components/member-v2-list-panel'

type MemberV2DeleteDialogProps = {
  target: MemberV2Row | null
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}

export function MemberV2DeleteDialog({
  target,
  isPending,
  onClose,
  onConfirm,
}: MemberV2DeleteDialogProps) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <AlertDialogContent className="surface-glass-modal">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className="font-semibold text-foreground">{target?.name}</span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
