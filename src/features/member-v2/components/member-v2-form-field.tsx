import type * as React from 'react'

import { Label } from '@/components/ui/label'

type MemberV2FormFieldProps = {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function MemberV2FormField({
  label,
  required,
  children,
}: MemberV2FormFieldProps) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required ? <span className="form-field-required"> *</span> : null}
      </Label>
      {children}
    </div>
  )
}
