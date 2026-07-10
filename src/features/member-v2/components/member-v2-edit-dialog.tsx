import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MemberV2FormField } from '@/features/member-v2/components/member-v2-form-field'
import type { MemberFormState } from '@/features/member-v2/components/member-v2-add-form'

export type EditFormState = MemberFormState & {
  id: number
}

type MemberV2EditDialogProps = {
  editForm: EditFormState | null
  isPending: boolean
  onClose: () => void
  onChange: React.Dispatch<React.SetStateAction<EditFormState | null>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function MemberV2EditDialog({
  editForm,
  isPending,
  onClose,
  onChange,
  onSubmit,
}: MemberV2EditDialogProps) {
  return (
    <Dialog
      open={!!editForm}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="surface-glass-modal sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit prime member</DialogTitle>
          <DialogDescription>
            Update member details. This will only update the selected member.
          </DialogDescription>
        </DialogHeader>

        {editForm ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <MemberV2FormField label="Name" required>
              <Input
                value={editForm.name}
                onChange={(event) =>
                  onChange((prev) =>
                    prev ? { ...prev, name: event.target.value } : prev,
                  )
                }
              />
            </MemberV2FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <MemberV2FormField label="Credit" required>
                <Input
                  type="number"
                  min="0"
                  value={editForm.credit}
                  onChange={(event) =>
                    onChange((prev) =>
                      prev ? { ...prev, credit: event.target.value } : prev,
                    )
                  }
                />
              </MemberV2FormField>

              <MemberV2FormField label="Percentage">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editForm.percentage}
                  onChange={(event) =>
                    onChange((prev) =>
                      prev
                        ? { ...prev, percentage: event.target.value }
                        : prev,
                    )
                  }
                />
              </MemberV2FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MemberV2FormField label="Mobile No">
                <Input
                  value={editForm.mobileNo}
                  onChange={(event) =>
                    onChange((prev) =>
                      prev ? { ...prev, mobileNo: event.target.value } : prev,
                    )
                  }
                />
              </MemberV2FormField>

              <MemberV2FormField label="Date">
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(event) =>
                    onChange((prev) =>
                      prev ? { ...prev, date: event.target.value } : prev,
                    )
                  }
                />
              </MemberV2FormField>
            </div>

            <MemberV2FormField label="Remarks">
              <Textarea
                value={editForm.remarks}
                onChange={(event) =>
                  onChange((prev) =>
                    prev ? { ...prev, remarks: event.target.value } : prev,
                  )
                }
                rows={3}
              />
            </MemberV2FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating…' : 'Update member'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
