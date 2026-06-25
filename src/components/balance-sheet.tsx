import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function formatSheetCell(value: number) {
  return value.toLocaleString('en-IN')
}

export function parseSheetAmount(value: string) {
  const parsed = Number.parseInt(value.replace(/,/g, '').trim() || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export type SheetTheme = 'period-left' | 'period-right' | 'main'

type SheetRowProps = {
  leftLabel?: string
  leftValue?: ReactNode
  leftInput?: ReactNode
  rightLabel?: string
  rightValue?: ReactNode
  rightInput?: ReactNode
  leftLabelTheme?: SheetTheme
  rightLabelTheme?: SheetTheme
  isTotal?: boolean
  totalVariant?: 'period' | 'main'
  isSpacer?: boolean
}

export function BalanceSheetRow({
  leftLabel,
  leftValue,
  leftInput,
  rightLabel,
  rightValue,
  rightInput,
  leftLabelTheme = 'main',
  rightLabelTheme = 'main',
  isTotal = false,
  totalVariant = 'main',
  isSpacer = false,
}: SheetRowProps) {
  if (isSpacer) {
    return (
      <div className="balance-sheet-row balance-sheet-spacer" aria-hidden>
        <div className="balance-sheet-label" />
        <div className="balance-sheet-value" />
        <div className="balance-sheet-label" />
        <div className="balance-sheet-value" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'balance-sheet-row',
        isTotal && `balance-sheet-row-total balance-sheet-row-total-${totalVariant}`,
      )}
    >
      <div
        className={cn(
          'balance-sheet-label',
          `balance-sheet-label-${leftLabelTheme}`,
        )}
      >
        {leftLabel}
      </div>
      <div className="balance-sheet-value">
        {leftInput ?? (
          <span className="balance-sheet-number">{leftValue}</span>
        )}
      </div>
      <div
        className={cn(
          'balance-sheet-label',
          `balance-sheet-label-${rightLabelTheme}`,
        )}
      >
        {rightLabel}
      </div>
      <div className="balance-sheet-value">
        {rightInput ?? (
          <span className="balance-sheet-number">{rightValue}</span>
        )}
      </div>
    </div>
  )
}

type SheetNumberInputProps = {
  id: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function SheetNumberInput({
  id,
  value,
  disabled,
  onChange,
}: SheetNumberInputProps) {
  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      className="balance-sheet-input"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

type ManualTotalCellProps = {
  id: string
  manualValue: string
  memberValue: number
  totalValue: number
  disabled?: boolean
  onManualChange: (value: string) => void
}

export function ManualTotalCell({
  id,
  manualValue,
  memberValue,
  totalValue,
  disabled,
  onManualChange,
}: ManualTotalCellProps) {
  return (
    <div className="balance-sheet-cell-stack">
      <span className="balance-sheet-number">{formatSheetCell(totalValue)}</span>
      <SheetNumberInput
        id={id}
        value={manualValue}
        disabled={disabled}
        onChange={onManualChange}
      />
      {memberValue > 0 ? (
        <span className="balance-sheet-cell-meta">
          + members {formatSheetCell(memberValue)}
        </span>
      ) : null}
    </div>
  )
}

type PersonSheetInputProps = {
  nameId: string
  amountId: string
  name: string
  amount: string
  disabled?: boolean
  onNameChange: (value: string) => void
  onAmountChange: (value: string) => void
}

export function PersonSheetInput({
  nameId,
  amountId,
  name,
  amount,
  disabled,
  onNameChange,
  onAmountChange,
}: PersonSheetInputProps) {
  return (
    <div className="balance-sheet-person-cell">
      <Input
        id={nameId}
        className="balance-sheet-person-name"
        placeholder="Name"
        value={name}
        disabled={disabled}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <SheetNumberInput
        id={amountId}
        value={amount}
        disabled={disabled}
        onChange={onAmountChange}
      />
    </div>
  )
}
