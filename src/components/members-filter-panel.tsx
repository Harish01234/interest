import { Filter, Search, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { GetMembersParams } from '@/members/types'

const typeFilterOptions = [
  { value: 'all', label: 'All types' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'both', label: 'Both' },
  { value: 'unknown', label: 'Unknown' },
] as const

const pageSizeOptions = [10, 20, 50] as const

type TypeFilter = GetMembersParams['type']

type SearchFilters = {
  name: string
  fatherName: string
  credit: string
}

type MembersFilterPanelProps = {
  name: string
  fatherName: string
  credit: string
  type: TypeFilter
  pageSize: (typeof pageSizeOptions)[number]
  onNameChange: (value: string) => void
  onFatherNameChange: (value: string) => void
  onCreditChange: (value: string) => void
  onTypeChange: (value: TypeFilter) => void
  onPageSizeChange: (value: (typeof pageSizeOptions)[number]) => void
  onClearFilters: () => void
}

type FilterFieldProps = {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function FilterField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: FilterFieldProps) {
  return (
    <div className="members-filter-field">
      <Label htmlFor={id} className="members-filter-label">
        {label}
      </Label>
      <div className="search-field">
        <Search className="search-field-icon" aria-hidden />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="search-field-input"
          aria-label={`Search by ${label.toLowerCase()}`}
        />
      </div>
    </div>
  )
}

type ActiveFilterChip = {
  key: keyof SearchFilters
  label: string
  value: string
}

function getActiveFilters(filters: SearchFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filters.name.trim()) {
    chips.push({ key: 'name', label: 'Name', value: filters.name.trim() })
  }
  if (filters.fatherName.trim()) {
    chips.push({
      key: 'fatherName',
      label: "Father's name",
      value: filters.fatherName.trim(),
    })
  }
  if (filters.credit.trim()) {
    chips.push({ key: 'credit', label: 'Credit', value: filters.credit.trim() })
  }

  return chips
}

export function MembersFilterPanel({
  name,
  fatherName,
  credit,
  type,
  pageSize,
  onNameChange,
  onFatherNameChange,
  onCreditChange,
  onTypeChange,
  onPageSizeChange,
  onClearFilters,
}: MembersFilterPanelProps) {
  const activeFilters = getActiveFilters({ name, fatherName, credit })
  const hasActiveFilters = activeFilters.length > 0

  const clearField = (key: keyof SearchFilters) => {
    if (key === 'name') onNameChange('')
    if (key === 'fatherName') onFatherNameChange('')
    if (key === 'credit') onCreditChange('')
  }

  return (
    <search
      className="members-filter-panel"
      aria-label="Member search filters"
    >
      <div className="members-filter-header">
        <div className="members-filter-intro">
          <div className="icon-tile icon-tile-primary shrink-0">
            <Filter className="size-4" aria-hidden />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">
              Search members
            </h3>
            <p className="text-sm text-muted-foreground">
              Narrow results by name, father&apos;s name, or credit.
            </p>
          </div>
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={onClearFilters}
            aria-label="Clear all search filters"
          >
            <X className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="members-filter-grid">
        <FilterField
          id="filter-name"
          label="Name"
          value={name}
          placeholder="e.g. Mohammed"
          onChange={onNameChange}
        />
        <FilterField
          id="filter-father-name"
          label="Father's name"
          value={fatherName}
          placeholder="e.g. Ahmed"
          onChange={onFatherNameChange}
        />
        <FilterField
          id="filter-credit"
          label="Credit"
          value={credit}
          placeholder="e.g. 5000"
          onChange={onCreditChange}
        />
      </div>

      {hasActiveFilters ? (
        <div className="members-filter-chips" aria-live="polite">
          <span className="text-xs font-medium text-muted-foreground">
            Active:
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="members-filter-chip"
            >
              <span>
                {filter.label}: {filter.value}
              </span>
              <button
                type="button"
                className="members-filter-chip-remove"
                aria-label={`Remove ${filter.label.toLowerCase()} filter`}
                onClick={() => clearField(filter.key)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Separator className="members-filter-separator" />

      <div className="members-filter-options">
        <p className="members-filter-options-label">Display options</p>
        <div className="members-filter-options-row">
          <div className="members-filter-option">
            <Label htmlFor="filter-type" className="members-filter-label">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(value) => onTypeChange(value as TypeFilter)}
            >
              <SelectTrigger
                id="filter-type"
                className="toolbar-select toolbar-select-md"
              >
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {typeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="members-filter-option">
            <Label htmlFor="filter-page-size" className="members-filter-label">
              Rows per page
            </Label>
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                onPageSizeChange(Number(value) as (typeof pageSizeOptions)[number])
              }
            >
              <SelectTrigger
                id="filter-page-size"
                className="toolbar-select toolbar-select-sm"
              >
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </search>
  )
}

export { pageSizeOptions, typeFilterOptions }
export type { TypeFilter }
