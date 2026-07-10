import * as React from 'react'
import { Plus } from 'lucide-react'

import { SectionCard } from '@/components/patterns/section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MemberV2FormField } from '@/features/member-v2/components/member-v2-form-field'

export type MemberFormState = {
  name: string
  credit: string
  percentage: string
  mobileNo: string
  date: string
  remarks: string
}

type MemberV2AddFormProps = {
  form: MemberFormState
  onChange: React.Dispatch<React.SetStateAction<MemberFormState>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function MemberV2AddForm({
  form,
  onChange,
  onSubmit,
  isPending,
}: MemberV2AddFormProps) {
  return (
    <SectionCard
      icon={Plus}
      iconVariant="accent"
      title="Add prime member"
      description="Add a new credit-only member with percentage."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <MemberV2FormField label="Name" required>
          <Input
            value={form.name}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Enter member name"
          />
        </MemberV2FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <MemberV2FormField label="Credit" required>
            <Input
              type="number"
              min="0"
              value={form.credit}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, credit: event.target.value }))
              }
              placeholder="0"
            />
          </MemberV2FormField>

          <MemberV2FormField label="Percentage">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.percentage}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  percentage: event.target.value,
                }))
              }
              placeholder="0"
            />
          </MemberV2FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MemberV2FormField label="Mobile No">
            <Input
              value={form.mobileNo}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, mobileNo: event.target.value }))
              }
              placeholder="Enter mobile no"
            />
          </MemberV2FormField>

          <MemberV2FormField label="Date">
            <Input
              type="date"
              value={form.date}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, date: event.target.value }))
              }
            />
          </MemberV2FormField>
        </div>

        <MemberV2FormField label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, remarks: event.target.value }))
            }
            placeholder="Optional remarks"
            rows={3}
          />
        </MemberV2FormField>

        <Button
          type="submit"
          className="btn-primary-glow w-full"
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Add member'}
        </Button>
      </form>
    </SectionCard>
  )
}
