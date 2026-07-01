import { useEffect, useRef, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

import { formatSheetCell, parseSheetAmount } from '@/components/balance-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function SheetReadOnlyAmountCell({
  amount,
  memberAddon = 0,
}: {
  amount: number
  memberAddon?: number
}) {
  return (
    <div className="inline-sheet-cell inline-sheet-cell-readonly">
      <div className="inline-sheet-cell-display">
        <span className="balance-sheet-number">{formatSheetCell(amount)}</span>
        {memberAddon > 0 ? (
          <span className="balance-sheet-cell-meta">
            incl. +{formatSheetCell(memberAddon)} from members
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function SheetReadOnlyTextCell({
  value,
  placeholder,
  uppercase = false,
  className,
}: {
  value: string
  placeholder: string
  uppercase?: boolean
  className?: string
}) {
  const displayText = value.trim() || placeholder

  return (
    <div className={cn('inline-sheet-cell inline-sheet-cell-readonly', className)}>
      <span
        className={cn(
          'inline-sheet-cell-text',
          !value.trim() && 'text-muted-foreground',
          uppercase && 'uppercase',
        )}
      >
        {displayText}
      </span>
    </div>
  )
}

type InlineEditableAmountCellProps = {
  id: string
  value: string
  /** Shown in view mode. Defaults to parsed `value`. */
  displayAmount?: number
  /** Member-derived portion shown as hint under the total. */
  memberAddon?: number
  disabled?: boolean
  pending?: boolean
  ariaLabel: string
  onChange: (value: string) => void
  onSave: (value: string) => void
}

export function InlineEditableAmountCell({
  id,
  value,
  displayAmount,
  memberAddon = 0,
  disabled,
  pending,
  ariaLabel,
  onChange,
  onSave,
}: InlineEditableAmountCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) {
      setDraft(value)
    }
  }, [value, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const cancelEdit = () => {
    setDraft(value)
    setEditing(false)
  }

  const commitEdit = () => {
    onChange(draft)
    onSave(draft)
    setEditing(false)
  }

  const shownAmount = displayAmount ?? parseSheetAmount(value)

  if (editing) {
    return (
      <div className="inline-sheet-cell inline-sheet-cell-editing">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          className="balance-sheet-input inline-sheet-cell-input"
          value={draft}
          disabled={disabled || pending}
          aria-label={ariaLabel}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitEdit()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelEdit()
            }
          }}
        />
        <InlineSheetActions
          pending={pending}
          disabled={disabled}
          saveLabel={`Save ${ariaLabel}`}
          cancelLabel={`Cancel editing ${ariaLabel}`}
          onSave={commitEdit}
          onCancel={cancelEdit}
        />
      </div>
    )
  }

  return (
    <div className="inline-sheet-cell">
      <div className="inline-sheet-cell-display">
        <span className="balance-sheet-number">{formatSheetCell(shownAmount)}</span>
        {memberAddon > 0 ? (
          <span className="balance-sheet-cell-meta">
            incl. +{formatSheetCell(memberAddon)} from members
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="inline-sheet-cell-action"
        disabled={disabled || pending}
        aria-label={`Edit ${ariaLabel}`}
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  )
}

type InlineEditableTextCellProps = {
  id: string
  value: string
  placeholder: string
  disabled?: boolean
  pending?: boolean
  ariaLabel: string
  className?: string
  uppercase?: boolean
  onChange: (value: string) => void
  onSave: (value: string) => void
}

export function InlineEditableTextCell({
  id,
  value,
  placeholder,
  disabled,
  pending,
  ariaLabel,
  className,
  uppercase = false,
  onChange,
  onSave,
}: InlineEditableTextCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) {
      setDraft(value)
    }
  }, [value, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const cancelEdit = () => {
    setDraft(value)
    setEditing(false)
  }

  const commitEdit = () => {
    onChange(draft)
    onSave(draft)
    setEditing(false)
  }

  const displayText = value.trim() || placeholder

  if (editing) {
    return (
      <div className={cn('inline-sheet-cell inline-sheet-cell-editing', className)}>
        <Input
          ref={inputRef}
          id={id}
          type="text"
          className={cn(
            'balance-sheet-label-input inline-sheet-cell-text-input',
            uppercase && 'uppercase',
          )}
          value={draft}
          placeholder={placeholder}
          disabled={disabled || pending}
          aria-label={ariaLabel}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitEdit()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelEdit()
            }
          }}
        />
        <InlineSheetActions
          pending={pending}
          disabled={disabled}
          saveLabel={`Save ${ariaLabel}`}
          cancelLabel={`Cancel editing ${ariaLabel}`}
          onSave={commitEdit}
          onCancel={cancelEdit}
        />
      </div>
    )
  }

  return (
    <div className={cn('inline-sheet-cell inline-sheet-cell-label', className)}>
      <span
        className={cn(
          'inline-sheet-cell-text',
          !value.trim() && 'text-muted-foreground',
          uppercase && 'uppercase',
        )}
      >
        {displayText}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="inline-sheet-cell-action inline-sheet-cell-action-compact"
        disabled={disabled || pending}
        aria-label={`Edit ${ariaLabel}`}
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  )
}

function InlineSheetActions({
  pending,
  disabled,
  saveLabel,
  cancelLabel,
  onSave,
  onCancel,
}: {
  pending?: boolean
  disabled?: boolean
  saveLabel: string
  cancelLabel: string
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="inline-sheet-cell-actions">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="inline-sheet-cell-action inline-sheet-cell-action-save"
        disabled={disabled || pending}
        aria-label={saveLabel}
        onClick={onSave}
      >
        {pending ? (
          <Spinner className="size-3.5" />
        ) : (
          <Check className="size-3.5" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="inline-sheet-cell-action inline-sheet-cell-action-cancel"
        disabled={disabled || pending}
        aria-label={cancelLabel}
        onClick={onCancel}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
