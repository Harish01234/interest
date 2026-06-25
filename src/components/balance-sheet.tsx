import type { ReactNode } from 'react'
import { CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { SectionCard } from '@/components/patterns/section-card'
import { Badge } from '@/components/ui/badge'
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
  leftLabel?: ReactNode
  leftValue?: ReactNode
  leftInput?: ReactNode
  rightLabel?: ReactNode
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
          leftLabel && `balance-sheet-label-${leftLabelTheme}`,
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
          rightLabel && `balance-sheet-label-${rightLabelTheme}`,
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
  compact?: boolean
  onChange: (value: string) => void
}

export function SheetNumberInput({
  id,
  value,
  disabled,
  compact = false,
  onChange,
}: SheetNumberInputProps) {
  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      className={cn('balance-sheet-input', compact && 'balance-sheet-input-compact')}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

type SheetLabelInputProps = {
  id: string
  value: string
  placeholder: string
  theme: SheetTheme
  disabled?: boolean
  onChange: (value: string) => void
}

export function SheetLabelInput({
  id,
  value,
  placeholder,
  theme,
  disabled,
  onChange,
}: SheetLabelInputProps) {
  return (
    <Input
      id={id}
      className={cn('balance-sheet-label-input', `balance-sheet-label-input-${theme}`)}
      placeholder={placeholder}
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
    <div className="balance-sheet-manual-cell">
      <span className="balance-sheet-number">{formatSheetCell(totalValue)}</span>
      <div className="balance-sheet-manual-row">
        <SheetNumberInput
          id={id}
          value={manualValue}
          disabled={disabled}
          compact
          onChange={onManualChange}
        />
        {memberValue > 0 ? (
          <span className="balance-sheet-cell-meta">
            +{formatSheetCell(memberValue)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

type WorksheetPanelProps = {
  title: string
  formula: string
  icon: LucideIcon
  actions: ReactNode
  isBalanced: boolean
  difference?: number
  children: ReactNode
  footer?: ReactNode
  variant?: 'period' | 'main'
}

export function WorksheetPanel({
  title,
  formula,
  icon,
  actions,
  isBalanced,
  difference = 0,
  children,
  footer,
  variant = 'period',
}: WorksheetPanelProps) {
  return (
    <SectionCard
      icon={icon}
      iconVariant={variant === 'period' ? 'chart1' : 'chart3'}
      title={title}
      description={formula}
      actions={actions}
      footer={footer}
      className={cn('calc-worksheet-panel', `calc-worksheet-panel-${variant}`)}
      bodyClassName="space-y-3 min-w-0"
    >
      <Badge
        variant="outline"
        className={cn(
          'w-fit gap-1.5 rounded-full px-3 py-1 font-semibold',
          isBalanced ? 'recon-banner-ok border-transparent' : 'recon-banner-bad border-transparent',
        )}
      >
        {isBalanced ? (
          <CheckCircle2 className="size-3.5" aria-hidden />
        ) : (
          <XCircle className="size-3.5" aria-hidden />
        )}
        {isBalanced ? 'Balanced' : `Off by ${formatSheetCell(Math.abs(difference))}`}
      </Badge>

      {children}
    </SectionCard>
  )
}

export function BalanceSheetScroll({
  children,
  minWidth = 560,
  label,
}: {
  children: ReactNode
  minWidth?: number
  label: string
}) {
  return (
    <div className="balance-sheet-scroll-wrap">
      <p className="balance-sheet-scroll-hint" aria-hidden>
        <ChevronRight className="size-3.5 shrink-0 opacity-70" />
        Swipe sideways to see all columns
      </p>
      <div className="balance-sheet-scroll">
        <div
          className="balance-sheet-grid"
          style={{ minWidth }}
          role="table"
          aria-label={label}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
