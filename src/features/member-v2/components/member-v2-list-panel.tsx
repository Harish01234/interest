import * as React from 'react'
import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import { SectionCard } from '@/components/patterns/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatDate,
  formatMoney,
  getInterest,
} from '@/features/member-v2/utils/formatters'

export type MemberV2Row = {
  id: number
  name: string
  credit: number
  percentage: number
  remarks: string | null
  mobileNo: string | null
  date: string
  active: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export type StatusFilter = 'all' | 'active' | 'inactive'

type MemberV2ListPanelProps = {
  members: MemberV2Row[]
  search: string
  status: StatusFilter
  isLoading: boolean
  isTogglePending: boolean
  filteredTotalCredit: number
  filteredTotalInterest: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onResetFilters: () => void
  onEdit: (member: MemberV2Row) => void
  onDelete: (member: MemberV2Row) => void
  onToggleActive: (values: { id: number; active: boolean }) => void
}

export function MemberV2ListPanel({
  members,
  search,
  status,
  isLoading,
  isTogglePending,
  filteredTotalCredit,
  filteredTotalInterest,
  onSearchChange,
  onStatusChange,
  onResetFilters,
  onEdit,
  onDelete,
  onToggleActive,
}: MemberV2ListPanelProps) {
  return (
    <SectionCard
      icon={UserRound}
      iconVariant="secondary"
      title="Prime members list"
      description="Search, filter, edit, activate, deactivate, or delete members."
      actions={
        <Badge variant="outline" className="badge-primary-soft">
          {members.length} shown
        </Badge>
      }
      className="overflow-hidden"
      bodyClassName="pt-0"
    >
      <div className="mb-4 space-y-4">
        <div className="data-toolbar">
          <div className="search-field">
            <Search className="search-field-icon" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, mobile, remarks…"
              className="search-field-input"
            />
          </div>

          <Tabs
            value={status}
            onValueChange={(value) => onStatusChange(value as StatusFilter)}
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-[270px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button type="button" variant="outline" onClick={onResetFilters}>
            <X className="mr-2 size-4" />
            Reset
          </Button>
        </div>
      </div>

      {isLoading ? (
        <MembersSkeleton />
      ) : members.length === 0 ? (
        <EmptyState onReset={onResetFilters} />
      ) : (
        <div className="data-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {members.map((member) => {
                const interest = getInterest(member.credit, member.percentage)

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex min-w-[180px] flex-col gap-1">
                        <span className="font-semibold">{member.name}</span>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {member.mobileNo ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" />
                              {member.mobileNo}
                            </span>
                          ) : null}

                          {member.remarks ? (
                            <span className="line-clamp-1">{member.remarks}</span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold tabular-nums">
                      {formatMoney(member.credit)}
                    </TableCell>

                    <TableCell className="tabular-nums">
                      {member.percentage}%
                    </TableCell>

                    <TableCell className="font-semibold text-primary tabular-nums">
                      {formatMoney(interest)}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(member.date)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={member.active}
                          disabled={isTogglePending}
                          onCheckedChange={(checked) =>
                            onToggleActive({ id: member.id, active: checked })
                          }
                        />

                        <Badge
                          variant="outline"
                          className={
                            member.active ? 'badge-accent' : 'badge-type-unknown'
                          }
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem onSelect={() => onEdit(member)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => onDelete(member)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell>Filtered total</TableCell>
                <TableCell className="tabular-nums">
                  {formatMoney(filteredTotalCredit)}
                </TableCell>
                <TableCell />
                <TableCell className="tabular-nums">
                  {formatMoney(Math.round(filteredTotalInterest))}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </SectionCard>
  )
}

function MembersSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="surface-muted flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="icon-tile icon-tile-accent">
        <Search className="size-5" />
      </div>

      <div>
        <h3 className="font-semibold">No members found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or filter.
        </p>
      </div>

      <Button type="button" variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  )
}
